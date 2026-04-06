"use client";

import { Zap } from "lucide-react";
import { DEMO_ADDRESSES } from "@/data/demo-addresses";
import { DemoAddressCard } from "./DemoAddressCard";

interface DemoModeSectionProps {
  onSelect: (address: string) => void;
}

export function DemoModeSection({ onSelect }: DemoModeSectionProps) {
  return (
    <section
      className="w-full"
      style={{ animation: "tv-fade-in-up 0.5s ease-out 0.9s both" }}
    >
      <div className="mb-5 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 text-white/70">
          <Zap className="h-4 w-4 text-[#84cc16]" />
          <h2 className="text-sm font-semibold tracking-wide">Try a Demo Address</h2>
        </div>
        <p className="text-xs text-white/30">
          Click any address to instantly run a trust query
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_ADDRESSES.map((demo) => (
          <DemoAddressCard key={demo.address} demo={demo} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
}
