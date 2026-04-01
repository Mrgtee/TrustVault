"use client";

import { useEffect, useState } from "react";
import type { TrustScoreData } from "@/hooks/useTrustScore";

function scoreColor(score: number): string {
  if (score >= 75) return "#84cc16";
  if (score >= 50) return "#eab308";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "High Trust";
  if (score >= 50) return "Medium Trust";
  if (score >= 25) return "Low Trust";
  return "Untrusted";
}

interface TrustScoreCardProps {
  data: TrustScoreData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function ScoreRing({ data, loading }: { data: TrustScoreData | null; loading: boolean }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const score = data?.overallScore ?? 0;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  const [displayScore, setDisplayScore] = useState(0);
  const color = scoreColor(score);

  // Animate stroke
  useEffect(() => {
    if (loading || !data) {
      setAnimatedOffset(circumference);
      setDisplayScore(0);
      return;
    }
    const targetOffset = circumference - (data.overallScore / 100) * circumference;
    const strokeTimer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 100);
    return () => clearTimeout(strokeTimer);
  }, [data, loading, circumference]);

  // Animate counter from 0 to score
  useEffect(() => {
    if (!data) return;
    const target = data.overallScore;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [data]);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 180 180" className="-rotate-90">
        {/* Track */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.3s ease" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white">
          {loading ? "--" : displayScore}
        </span>
        <span className="mt-1 text-xs font-medium" style={{ color }}>
          {loading ? "Loading..." : scoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

function SkeletonPill() {
  return <div className="h-8 w-28 animate-pulse rounded-full bg-white/5" />;
}

export function TrustScoreCard({ data, loading, error, onRetry }: TrustScoreCardProps) {
  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm"
        style={{ animation: "tv-fade-in-up 0.5s ease-out both" }}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm text-white/70">{error}</p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-10"
      style={{ animation: "tv-fade-in-up 0.5s ease-out both" }}
    >
      {/* Score ring */}
      <ScoreRing data={data} loading={loading} />

      {/* Metric pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {loading ? (
          <>
            <SkeletonPill />
            <SkeletonPill />
            <SkeletonPill />
          </>
        ) : (
          <>
            <MetricPill label="EigenTrust" value={data?.eigenTrust ?? 0} />
            <MetricPill label="AgentRank" value={data?.agentRank ?? 0} />
            <SybilPill risk={data?.sybilRisk ?? "Medium"} />
          </>
        )}
      </div>

      {/* Encrypt CTA */}
      <button
        className="mt-10 w-full rounded-lg bg-[#84cc16] py-3.5 text-sm font-semibold text-black transition-all hover:bg-[#a3e635] hover:shadow-[0_0_24px_rgba(132,204,22,0.3)] disabled:opacity-40 disabled:hover:bg-[#84cc16] disabled:hover:shadow-none"
        disabled={loading}
      >
        Encrypt Score On-Chain
      </button>
      <p className="mt-3 text-xs text-white/30">
        Requires wallet connection on Base Sepolia
      </p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/60">
      <span className="text-white/40">{label}:</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function SybilPill({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const colorMap = { Low: "#84cc16", Medium: "#eab308", High: "#ef4444" };
  const color = colorMap[risk];

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/60">
      <span className="text-white/40">Sybil Risk:</span>
      <span className="font-semibold" style={{ color }}>{risk}</span>
    </div>
  );
}
