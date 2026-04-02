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
  const response = await fetch("/api/trust-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
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
