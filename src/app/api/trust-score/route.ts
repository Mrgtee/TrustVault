import { NextRequest, NextResponse } from "next/server"

const MCP_BASE = "https://mcp-trust.intuition.box"
const MCP_TIMEOUT = 20_000

interface SseEvent {
  event?: string
  data?: string
}

interface McpCompositeResult {
  address: string
  compositeScore: number
  confidence: number
  breakdown: {
    eigentrust: { score: number; normalizedScore: number; rank: number }
    agentrank: { score: number; normalizedScore: number; rank: number }
    transitiveTrust: { score: number; paths: number; maxHops: number }
  }
  metadata: {
    totalNodes: number
    computeTimeMs: number
    dataFreshness: string
  }
}

function parseSseChunk(text: string): { events: SseEvent[]; remaining: string } {
  const events: SseEvent[] = []
  const parts = text.split("\n\n")
  const remaining = parts.pop() || ""

  for (const block of parts) {
    if (!block.trim()) continue
    const evt: SseEvent = {}
    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) evt.event = line.slice(7).trim()
      else if (line.startsWith("data: ")) evt.data = line.slice(6)
    }
    if (evt.data !== undefined) events.push(evt)
  }

  return { events, remaining }
}

function deriveSybilRisk(
  compositeScore: number,
  eigentrustRank: number,
  totalNodes: number
): "Low" | "Medium" | "High" {
  const percentile = 1 - eigentrustRank / totalNodes
  if (compositeScore >= 60 && percentile >= 0.5) return "Low"
  if (compositeScore >= 30 || percentile >= 0.2) return "Medium"
  return "High"
}

function mapToTrustScore(raw: McpCompositeResult) {
  // compositeScore is already 0-100, normalizedScore is 0-1
  const eigenTrust = Math.round(raw.breakdown.eigentrust.normalizedScore * 100)
  const agentRank = Math.round(raw.breakdown.agentrank.normalizedScore * 100)
  const overallScore = Math.round(raw.compositeScore)
  const rankPercentile = 1 - raw.breakdown.eigentrust.rank / raw.metadata.totalNodes

  return {
    address: raw.address,
    overallScore,
    eigenTrust,
    agentRank,
    sybilRisk: deriveSybilRisk(
      raw.compositeScore,
      raw.breakdown.eigentrust.rank,
      raw.metadata.totalNodes
    ),
    factors: [
      { name: "EigenTrust Score", score: eigenTrust },
      { name: "AgentRank Score", score: agentRank },
      { name: "Transitive Trust Paths", score: raw.breakdown.transitiveTrust.paths },
      { name: "Network Position", score: Math.round(rankPercentile * 100) },
      { name: "Confidence", score: Math.round(raw.confidence * 100) },
    ],
    dataSource: "Intuition Protocol Graph",
    timestamp: raw.metadata.dataFreshness,
  }
}

async function callMcpTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MCP_TIMEOUT)

  try {
    // Open SSE connection
    const sseRes = await fetch(`${MCP_BASE}/sse`, {
      headers: { Accept: "text/event-stream" },
      signal: controller.signal,
    })

    if (!sseRes.ok || !sseRes.body) {
      throw new Error(`SSE connect failed: ${sseRes.status}`)
    }

    const reader = sseRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let sessionPath = ""

    const readEvents = async (): Promise<SseEvent[]> => {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) throw new Error("SSE stream closed unexpectedly")
        buffer += decoder.decode(value, { stream: true })
        const { events, remaining } = parseSseChunk(buffer)
        buffer = remaining
        if (events.length > 0) return events
      }
    }

    const waitForId = async (id: number): Promise<Record<string, unknown>> => {
      for (;;) {
        const events = await readEvents()
        for (const evt of events) {
          if (evt.event === "message" && evt.data) {
            const parsed = JSON.parse(evt.data)
            if (parsed.id === id) return parsed
          }
        }
      }
    }

    const send = async (body: Record<string, unknown>) => {
      const res = await fetch(`${MCP_BASE}${sessionPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok && res.status !== 202) {
        const text = await res.text()
        throw new Error(`MCP POST failed (${res.status}): ${text}`)
      }
    }

    // Read session endpoint
    const firstEvents = await readEvents()
    const ep = firstEvents.find((e) => e.event === "endpoint")
    if (!ep?.data) throw new Error("No session endpoint received")
    sessionPath = ep.data

    // Initialize handshake
    await send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "TrustVault", version: "1.0" },
      },
    })
    const initResult = await waitForId(1)
    if ("error" in initResult) {
      throw new Error(`MCP init failed: ${JSON.stringify(initResult.error)}`)
    }

    // Send initialized notification
    await send({ jsonrpc: "2.0", method: "notifications/initialized" })

    // Call tool
    await send({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: toolName, arguments: args },
    })
    const toolResult = await waitForId(2)

    // Close SSE stream
    reader.cancel().catch(() => {})

    if ("error" in toolResult) {
      throw new Error(`Tool error: ${JSON.stringify(toolResult.error)}`)
    }

    return toolResult
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const address = body.address

  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 })
  }

  try {
    const mcpResponse = await callMcpTool("compute_composite_score", { address })

    // MCP tool responses wrap content in result.content[].text
    const content = (mcpResponse as { result?: { content?: Array<{ text?: string }> } })
      .result?.content
    if (!content?.[0]?.text) {
      throw new Error("Unexpected MCP response structure")
    }

    const raw: McpCompositeResult = JSON.parse(content[0].text)
    const result = mapToTrustScore(raw)

    return NextResponse.json({ result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "MCP unavailable"
    return NextResponse.json(
      { error: { message, code: "MCP_UNAVAILABLE" } },
      { status: 503 }
    )
  }
}
