"use client";

import { Wallet, Search, Lock, ShieldCheck, type LucideIcon } from "lucide-react";

interface StepCard {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: StepCard[] = [
  {
    step: "01",
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Connect any EVM wallet on Base Sepolia. No new chain, no new wallet.",
  },
  {
    step: "02",
    icon: Search,
    title: "Query Trust Score",
    description:
      "We query your address against 16K+ node graph using EigenTrust and AgentRank algorithms.",
  },
  {
    step: "03",
    icon: Lock,
    title: "Encrypt On-Chain",
    description:
      "Your score is encrypted as euint256 via Inco Lightning. The threshold stays hidden too.",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Gate Access",
    description:
      "Confidential comparison grants or denies access. Nobody sees the score or threshold \u2014 only the outcome.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div
          className="mb-14 text-center"
          style={{ animation: "tv-fade-in-up 0.6s ease-out both" }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#84cc16]">
            How It Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Four steps to confidential trust
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((card, i) => (
            <div
              key={card.step}
              className="group relative rounded-xl p-6"
              style={{
                animation: `tv-fade-in-up 0.6s ease-out ${i * 0.1}s both`,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(132,204,22,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              {/* Step number */}
              <span className="absolute right-5 top-5 font-mono text-sm text-white/10">
                {card.step}
              </span>

              {/* Icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#84cc16]/10">
                <card.icon className="h-5 w-5 text-[#84cc16]" />
              </div>

              <h3 className="mb-2 text-base font-semibold text-white">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
