export interface TrustScoreResponse {
  address: string;
  overallScore: number;
  eigenTrust: number;
  agentRank: number;
  sybilRisk: "Low" | "Medium" | "High";
  factors: Array<{ name: string; score: number }>;
  dataSource: string;
  timestamp: string;
}

export async function queryTrustScore(
  address: string,
  signal?: AbortSignal
): Promise<TrustScoreResponse> {
  const response = await fetch("https://mcp-trust.intuition.box", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_trust_score",
        arguments: {
          address: address,
          include_breakdown: true,
        },
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error("MCP endpoint unreachable");
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "MCP error");
  }

  return data.result;
}
