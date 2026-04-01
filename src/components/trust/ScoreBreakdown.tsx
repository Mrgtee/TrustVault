"use client";

import { useEffect, useState } from "react";
import type { TrustScoreFactor } from "@/hooks/useTrustScore";

interface ScoreBreakdownProps {
  factors: TrustScoreFactor[] | null;
  dataSource: string | null;
  timestamp: string | null;
  loading: boolean;
}

function FactorBar({ name, score, delay }: { name: string; score: number; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 100 + delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{name}</span>
        <span className="text-xs font-medium text-white/70">{score}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[#84cc16]"
          style={{
            width: `${width}%`,
            transition: "width 1s ease-out",
          }}
        />
      </div>
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-8 animate-pulse rounded bg-white/5" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06]" />
    </div>
  );
}

export function ScoreBreakdown({ factors, dataSource, timestamp, loading }: ScoreBreakdownProps) {
  const formattedTime = timestamp
    ? formatRelativeTime(timestamp)
    : "just now";

  return (
    <div
      className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
      style={{ animation: "tv-fade-in-up 0.5s ease-out 0.15s both" }}
    >
      <h3 className="mb-6 text-sm font-semibold text-white">Score Breakdown</h3>

      {/* Factor bars */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonBar />
            <SkeletonBar />
            <SkeletonBar />
            <SkeletonBar />
            <SkeletonBar />
          </>
        ) : (
          factors?.map((f, i) => (
            <FactorBar key={f.name} name={f.name} score={f.score} delay={i * 100} />
          ))
        )}
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-white/[0.06]" />

      {/* Data source */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-white/30">
          Data Source
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{dataSource ?? "Intuition Protocol Graph"}</span>
            <svg className="h-3 w-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#84cc16]" />
          </span>
          Base Sepolia Activity
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-6 border-t border-white/[0.06] pt-4">
        <p className="text-xs text-white/20">
          Last updated: {formattedTime}
        </p>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
