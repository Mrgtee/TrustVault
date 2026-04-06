"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTrustScore } from "@/hooks/useTrustScore";
import { TrustScoreCard } from "./TrustScoreCard";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { DemoModeSection } from "./DemoModeSection";

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function AnimatedDots() {
  return (
    <span className="inline-flex w-6">
      <span className="animate-pulse">.</span>
      <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
      <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
    </span>
  );
}

export function QueryPage({ address }: { address: string }) {
  const router = useRouter();
  const { loading, error, data, retry, isFallback } = useTrustScore(address);
  const [queryInput, setQueryInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  function handleQuery() {
    const trimmed = queryInput.trim();
    if (!trimmed) {
      setInputError(true);
      setValidationMsg("");
      setTimeout(() => setInputError(false), 1000);
      return;
    }
    if (!isValidAddress(trimmed)) {
      setInputError(true);
      setValidationMsg("Must be 42 characters starting with 0x");
      setTimeout(() => {
        setInputError(false);
        setValidationMsg("");
      }, 3000);
      return;
    }
    setValidationMsg("");
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
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
              <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden rounded-xl border border-white/10 bg-[#141414] px-3 py-2 font-mono text-xs text-white/60 shadow-xl group-hover:block">
                {address}
              </div>
            </div>
          </div>
        </div>

        {/* Query another */}
        <div className="w-full max-w-xs">
          <div
            className="flex w-full rounded-xl border bg-white/[0.04] backdrop-blur-sm"
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
              className="m-0.5 rounded-lg bg-[#84cc16] px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-[#a3e635]"
            >
              Query
            </button>
          </div>
          {validationMsg && (
            <p className="mt-1.5 text-xs text-red-400">{validationMsg}</p>
          )}
        </div>
      </div>

      {/* Loading status text */}
      {loading && (
        <div
          className="mb-6 flex items-center justify-center gap-2 text-sm text-white/40"
          style={{ animation: "tv-fade-in 0.3s ease-out both" }}
        >
          <svg className="h-4 w-4 animate-spin text-[#84cc16]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Querying trust graph<AnimatedDots /></span>
        </div>
      )}

      {/* Fallback banner */}
      {isFallback && !loading && (
        <div
          className="mb-6 rounded-xl border border-[#eab308]/20 bg-[#eab308]/5 px-4 py-3 text-center text-xs text-[#eab308]/80"
          style={{ animation: "tv-fade-in-up 0.3s ease-out both" }}
        >
          Trust graph unavailable -- showing cached estimate
        </div>
      )}

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

      {/* Demo addresses */}
      <div className="mt-12">
        <DemoModeSection
          onSelect={(addr) => {
            setQueryInput(addr);
            router.push(`/query?address=${encodeURIComponent(addr)}`);
          }}
        />
      </div>
    </div>
  );
}
