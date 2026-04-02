import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const address = body.address

  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 })
  }

  try {
    const response = await fetch("https://mcp-trust.intuition.box", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_trust_score",
          arguments: { address, include_breakdown: true }
        }
      }),
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) throw new Error("MCP error")
    const data = await response.json()
    return NextResponse.json(data)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ error: "MCP unavailable" }, { status: 503 })
  }
}
