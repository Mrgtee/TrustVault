"use client";

import { useEffect, useState, useCallback } from "react";
import { queryTrustScore } from "@/lib/trustMcp";

export interface TrustScoreFactor {
  name: string;
  score: number;
}

export interface TrustScoreData {
  address: string;
  overallScore: number;
  eigenTrust: number;
  agentRank: number;
  sybilRisk: "Low" | "Medium" | "High";
  factors: TrustScoreFactor[];
  dataSource: string;
  timestamp: string;
}

function isValidAddress(addr: string): boolean {
  return typeof addr === "string" && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function generateMockData(address: string): TrustScoreData {
  const hex = address.slice(-6);
  const num = parseInt(hex, 16);
  const overallScore = 40 + (num % 55);
  const eigenTrust = Math.round(overallScore * 0.9 + (num % 10));
  const agentRank = Math.round(overallScore * 0.85 + (num % 8));
  const sybilRisk: "Low" | "Medium" | "High" =
    overallScore > 70 ? "Low" : overallScore > 50 ? "Medium" : "High";

  return {
    address,
    overallScore,
    eigenTrust,
    agentRank,
    sybilRisk,
    factors: [
      { name: "Transaction History", score: Math.min(95, overallScore + (num % 15)) },
      { name: "Network Connections", score: Math.min(95, overallScore - (num % 10)) },
      { name: "Attestation Strength", score: Math.min(95, overallScore + (num % 8)) },
      { name: "Sybil Resistance", score: Math.min(95, overallScore - (num % 5)) },
      { name: "Activity Recency", score: Math.min(95, overallScore + (num % 12)) },
    ],
    dataSource: "mock",
    timestamp: new Date().toISOString(),
  };
}

export function useTrustScore(address: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrustScoreData | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchScore = useCallback(async (addr: string) => {
    if (!isValidAddress(addr)) {
      setError("Invalid address format. Must be 42 characters starting with 0x.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setIsFallback(false);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const result = await queryTrustScore(addr, controller.signal);
      clearTimeout(timeout);

      setData(result as TrustScoreData);
      setLoading(false);
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      console.warn(
        isTimeout ? "MCP request timed out, using fallback" : "MCP unavailable, using fallback"
      );
      setIsFallback(true);
      setData(generateMockData(addr));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    fetchScore(address);
  }, [address, fetchScore]);

  const retry = useCallback(() => {
    if (address) {
      fetchScore(address);
    }
  }, [address, fetchScore]);

  return { loading, error, data, retry, isFallback };
}
