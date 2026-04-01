"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTrustScore } from "@/hooks/useTrustScore";
import { TrustScoreCard } from "./TrustScoreCard";
import { ScoreBreakdown } from "./ScoreBreakdown";

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function QueryPage({ address }: { address: string }) {
  const router = useRouter();
  const { loading, error, data, retry } = useTrustScore(address);
  const [queryInput, setQueryInput] = useState("");
  const [inputError, setInputError] = useState(false);

  function handleQuery() {
    const trimmed = queryInput.trim();
    if (!trimmed) {
      setInputError(true);
      setTimeout(() => setInputError(false), 1000);
      return;
    }
    router.push(`/query?address=${encodeURIComponent(trimmed)}`);
  }

  function handleRetry() {
    retry();
    router.replace(`/query?address=${encodeURIComponent(address)}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      {/* Top bar */}
      <div
        className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ animation: "tv-fade-in-up 0.5s ease-out both" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Trust Score Analysis
            </h1>
            <div className="group relative mt-1 inline-block">
              <p className="cursor-default font-mono text-sm text-white/40">
                {truncateAddress(address)}
              </p>
              {/* Full address tooltip */}
              <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden rounded-lg border border-white/10 bg-[#141414] px-3 py-2 font-mono text-xs text-white/60 shadow-xl group-hover:block">
                {address}
              </div>
            </div>
          </div>
        </div>

        {/* Query another */}
        <div className="flex w-full max-w-xs">
          <div
            className="flex w-full rounded-lg border bg-white/[0.04] backdrop-blur-sm"
            style={{
              borderColor: inputError ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.15)",
              transition: "border-color 0.3s ease",
            }}
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              placeholder="Query another 0x..."
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-white/25 outline-none"
            />
            <button
              onClick={handleQuery}
              className="m-0.5 rounded-md bg-[#84cc16] px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-[#a3e635]"
            >
              Query
            </button>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrustScoreCard data={data} loading={loading} error={error} onRetry={handleRetry} />
        </div>
        <div className="lg:col-span-1">
          <ScoreBreakdown
            factors={data?.factors ?? null}
            dataSource={data?.dataSource ?? null}
            timestamp={data?.timestamp ?? null}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
