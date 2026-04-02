"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import type { TrustScoreData } from "@/hooks/useTrustScore";
import { useVault, type VaultStatus } from "@/hooks/useVault";

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

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function statusLabel(status: VaultStatus): string {
  switch (status) {
    case "encrypting":
      return "Encrypting with Inco Lightning...";
    case "storing":
      return "Storing on Base Sepolia...";
    case "checking":
      return "Checking vault access...";
    default:
      return "";
  }
}

function VaultSection({
  data,
  loading,
}: {
  data: TrustScoreData | null;
  loading: boolean;
}) {
  const { address, isConnected, status } = useAccount();
  const walletReady = isConnected && !!address && status === "connected";
  const vault = useVault();
  const isBusy =
    vault.status === "encrypting" ||
    vault.status === "storing" ||
    vault.status === "checking";

  // Error state
  if (vault.status === "error") {
    return (
      <div className="mt-10 w-full space-y-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-xs text-red-400">{vault.error}</p>
        </div>
        <button
          onClick={vault.reset}
          className="w-full rounded-lg border border-white/20 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Access result — granted
  if (vault.accessResult === true) {
    return (
      <div className="mt-10 w-full space-y-4">
        <div
          className="flex items-center justify-center gap-3 rounded-lg border border-[#84cc16]/30 bg-[#84cc16]/10 py-4"
          style={{ animation: "tv-fade-in-up 0.4s ease-out both" }}
        >
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#84cc16]" />
          </div>
          <span className="text-sm font-bold tracking-wide text-[#84cc16]">
            ACCESS GRANTED
          </span>
        </div>
        <p className="text-center text-xs text-white/30">
          Score meets the encrypted threshold
        </p>
      </div>
    );
  }

  // Access result — denied
  if (vault.accessResult === false) {
    return (
      <div className="mt-10 w-full space-y-4">
        <div
          className="flex items-center justify-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 py-4"
          style={{ animation: "tv-fade-in-up 0.4s ease-out both" }}
        >
          <span className="text-sm font-bold tracking-wide text-red-400">
            ACCESS DENIED
          </span>
        </div>
        <p className="text-center text-xs text-white/40">
          Score below threshold
        </p>
      </div>
    );
  }

  // Success — score stored, show check access button
  if (vault.status === "success" && vault.hasStoredScore) {
    return (
      <div className="mt-10 w-full space-y-3">
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-[#84cc16]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span className="font-semibold">Score Encrypted</span>
        </div>
        {vault.txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${vault.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-white/30 underline decoration-white/10 transition-colors hover:text-white/50"
          >
            View transaction
          </a>
        )}
        <button
          onClick={vault.checkAccess}
          className="w-full rounded-lg border border-[#84cc16]/30 bg-[#84cc16]/10 py-3.5 text-sm font-semibold text-[#84cc16] transition-all hover:bg-[#84cc16]/20"
        >
          Check Vault Access
        </button>
      </div>
    );
  }

  // Busy — encrypting / storing / checking
  if (isBusy) {
    return (
      <div className="mt-10 w-full space-y-3">
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#84cc16]/50 py-3.5 text-sm font-semibold text-black"
        >
          <Spinner />
          {statusLabel(vault.status)}
        </button>
        {vault.txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${vault.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-white/30 underline decoration-white/10 transition-colors hover:text-white/50"
          >
            View transaction
          </a>
        )}
      </div>
    );
  }

  // Wallet not connected
  if (!walletReady) {
    return (
      <div className="mt-10 w-full space-y-3">
        <ConnectKitButton.Custom>
          {({ isConnected, show }) => (
            <button
              onClick={show}
              className="w-full py-4 rounded-xl font-semibold text-black bg-lime-500 hover:bg-lime-400 transition-colors"
            >
              {isConnected ? "Switch to Base Sepolia" : "Connect Wallet to Encrypt Score"}
            </button>
          )}
        </ConnectKitButton.Custom>
        <p className="text-center text-xs text-white/30">
          No wallet needed to query -- connection only required for on-chain encryption
        </p>
      </div>
    );
  }

  // Connected, idle — show encrypt button
  return (
    <div className="mt-10 w-full space-y-3">
      <button
        onClick={() => data && vault.encryptAndStore(data.overallScore)}
        disabled={loading || !data}
        className="w-full rounded-lg bg-[#84cc16] py-3.5 text-sm font-semibold text-black transition-all hover:bg-[#a3e635] hover:shadow-[0_0_24px_rgba(132,204,22,0.3)] disabled:opacity-40 disabled:hover:bg-[#84cc16] disabled:hover:shadow-none"
      >
        Encrypt Score On-Chain
      </button>
      <p className="mt-3 text-xs text-white/30">
        Requires wallet connection on Base Sepolia
      </p>
    </div>
  );
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

      {/* Vault interaction section */}
      <VaultSection data={data} loading={loading} />
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
