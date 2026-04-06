import { NextRequest, NextResponse } from "next/server"

const MCP_BASE = "https://mcp-trust.intuition.box"
const MCP_TIMEOUT = 30_000

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
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  try {
    // Open SSE connection
    const sseRes = await fetch(`${MCP_BASE}/sse`, {
      headers: { Accept: "text/event-stream" },
      signal: controller.signal,
    })

    if (!sseRes.ok || !sseRes.body) {
      throw new Error(`SSE connect failed: ${sseRes.status}`)
    }

    reader = sseRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let sessionPath = ""

    const readEvents = async (): Promise<SseEvent[]> => {
      for (;;) {
        const { done, value } = await reader!.read()
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

    if ("error" in toolResult) {
      throw new Error(`Tool error: ${JSON.stringify(toolResult.error)}`)
    }

    return toolResult
  } finally {
    clearTimeout(timeout)
    // Always close the SSE stream, on success or failure.
    if (reader) {
      reader.cancel().catch(() => {})
    }
  }
}

const BASE_SEPOLIA_RPC = "https://sepolia.base.org"

async function getBaseSepoliaActivity(address: string) {
  try {
    const [txCountRes, balanceRes] = await Promise.all([
      fetch(BASE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getTransactionCount",
          params: [address, "latest"],
        }),
      }),
      fetch(BASE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
      }),
    ])

    const txCountData = await txCountRes.json()
    const txCount = parseInt(txCountData.result, 16)

    const balanceData = await balanceRes.json()
    const balanceWei = BigInt(balanceData.result)
    const balanceEth = Number(balanceWei) / 1e18

    return {
      txCount,
      balanceEth,
      hasBaseSepolia: txCount > 0 || balanceEth > 0,
    }
  } catch {
    return { txCount: 0, balanceEth: 0, hasBaseSepolia: false }
  }
}

function computeActivityScore(chainActivity: {
  txCount: number
  balanceEth: number
}) {
  let score = 0
  if (chainActivity.txCount > 0) score += 20
  if (chainActivity.txCount > 10) score += 10
  if (chainActivity.txCount > 50) score += 10
  if (chainActivity.txCount > 100) score += 10
  if (chainActivity.balanceEth > 0) score += 10
  return Math.min(score, 50)
}

// Trust scores are dynamic and address-specific. Never cache the response.
export const dynamic = "force-dynamic"

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const

export async function POST(req: NextRequest) {
  const body = await req.json()
  const address = body.address

  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return NextResponse.json(
      { error: "Invalid address" },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  // Fetch MCP score and on-chain activity in parallel
  const [mcpResult, chainActivity] = await Promise.all([
    (async () => {
      try {
        const mcpResponse = await callMcpTool("compute_composite_score", {
          address,
        })
        const content = (
          mcpResponse as {
            result?: { content?: Array<{ text?: string }> }
          }
        ).result?.content
        if (!content?.[0]?.text) return null
        const raw: McpCompositeResult = JSON.parse(content[0].text)
        return mapToTrustScore(raw)
      } catch {
        return null
      }
    })(),
    getBaseSepoliaActivity(address),
  ])

  const activityScore = computeActivityScore(chainActivity)

  // Hybrid scoring: combine Intuition graph with on-chain activity
  let finalScore: number
  let dataSource: string
  let sybilRisk: "Low" | "Medium" | "High"
  let factors: Array<{ name: string; score: number }>

  if (mcpResult && mcpResult.overallScore > 0) {
    // Intuition graph has data: 70% Intuition + 30% activity
    finalScore = Math.round(mcpResult.overallScore * 0.7 + activityScore * 0.3)
    dataSource = "Intuition Protocol Graph + Base Sepolia Activity"
    sybilRisk = finalScore >= 60 ? "Low" : finalScore >= 30 ? "Medium" : "High"
    factors = [
      ...mcpResult.factors,
      {
        name: "Base Sepolia Tx Count",
        score: Math.min(95, chainActivity.txCount * 2),
      },
      {
        name: "Base Sepolia Balance",
        score: chainActivity.balanceEth > 0 ? 60 : 0,
      },
    ]
  } else if (chainActivity.hasBaseSepolia) {
    // No Intuition data but has on-chain activity
    finalScore = activityScore
    dataSource = "Base Sepolia Activity"
    sybilRisk = finalScore >= 60 ? "Low" : finalScore >= 30 ? "Medium" : "High"
    factors = [
      {
        name: "Transaction Count",
        score: Math.min(95, chainActivity.txCount * 2),
      },
      { name: "Wallet Age", score: 40 },
      {
        name: "ETH Balance",
        score: chainActivity.balanceEth > 0 ? 60 : 0,
      },
      {
        name: "Network Activity",
        score: chainActivity.hasBaseSepolia ? 50 : 0,
      },
      { name: "Sybil Resistance", score: finalScore },
    ]
  } else {
    // No data at all
    finalScore = 0
    dataSource = "No on-chain activity found"
    sybilRisk = "High"
    factors = [
      { name: "Transaction Count", score: 0 },
      { name: "Wallet Age", score: 0 },
      { name: "ETH Balance", score: 0 },
      { name: "Network Activity", score: 0 },
      { name: "Sybil Resistance", score: 0 },
    ]
  }

  const result = {
    address,
    overallScore: finalScore,
    sybilRisk,
    factors,
    dataSource,
    timestamp: new Date().toISOString(),
    ...(mcpResult && mcpResult.overallScore > 0
      ? {
          eigenTrust: mcpResult.eigenTrust,
          agentRank: mcpResult.agentRank,
        }
      : {}),
    chainActivity: {
      txCount: chainActivity.txCount,
      balanceEth: chainActivity.balanceEth,
      activityScore,
    },
  }

  return NextResponse.json({ result }, { headers: NO_STORE_HEADERS })
}
