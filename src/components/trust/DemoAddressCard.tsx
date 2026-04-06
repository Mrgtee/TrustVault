"use client";

import type { DemoAddress, DemoTier } from "@/data/demo-addresses";

const TIER_CONFIG: Record<DemoTier, { label: string; bg: string; text: string; border: string; glow: string }> = {
  high: {
    label: "High Trust",
    bg: "bg-[#84cc16]/10",
    text: "text-[#84cc16]",
    border: "border-[#84cc16]/30",
    glow: "rgba(132,204,22,0.15)",
  },
  medium: {
    label: "Medium Trust",
    bg: "bg-[#eab308]/10",
    text: "text-[#eab308]",
    border: "border-[#eab308]/30",
    glow: "rgba(234,179,8,0.15)",
  },
  low: {
    label: "Low Trust",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "rgba(239,68,68,0.15)",
  },
};

interface DemoAddressCardProps {
  demo: DemoAddress;
  onClick: (address: string) => void;
}

export function DemoAddressCard({ demo, onClick }: DemoAddressCardProps) {
  const tier = TIER_CONFIG[demo.tier];
  const truncated = `${demo.address.slice(0, 6)}...${demo.address.slice(-4)}`;

  return (
    <button
      type="button"
      onClick={() => onClick(demo.address)}
      className="group flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06]"
      style={{ "--card-glow": tier.glow } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = tier.glow.replace("0.15", "0.5");
        e.currentTarget.style.boxShadow = `0 0 20px ${tier.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{demo.label}</p>
          <p className="mt-0.5 font-mono text-xs text-white/30">{truncated}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tier.bg} ${tier.text} ${tier.border} border`}
        >
          {tier.label}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-white/40">{demo.description}</p>
    </button>
  );
}
