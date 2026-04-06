"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoModeSection } from "./DemoModeSection";

export function HeroSection() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [address, setAddress] = useState("");
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleQuery() {
    const trimmed = address.trim();
    if (!trimmed) {
      setInputError(true);
      setTimeout(() => setInputError(false), 1000);
      return;
    }
    router.push(`/query?address=${encodeURIComponent(trimmed)}`);
  }

  const opacity = Math.max(0, 1 - scrollY / 350);
  const scale = Math.max(0.96, 1 - scrollY / 5000);
  const translateY = scrollY * -0.15;
  const blur = Math.min(6, scrollY / 60);

  return (
    <section className="relative overflow-hidden px-4" style={{ paddingTop: 160, paddingBottom: 120 }}>
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          filter: `blur(${blur}px)`,
          transition:
            "opacity 0.05s linear, transform 0.05s linear, filter 0.05s linear",
        }}
      >
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60 backdrop-blur-sm"
          style={{ animation: "tv-scale-in 0.5s ease-out both" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#84cc16]" />
          </span>
          Built on Inco Lightning &times; Base Sepolia
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h1
            className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animation: "tv-fade-in-up 0.6s ease-out 0.15s both" }}
          >
            Trust is the missing
          </h1>
          <h1
            className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animation: "tv-fade-in-up 0.6s ease-out 0.3s both" }}
          >
            Web3{" "}
            <span className="text-[#84cc16]">privacy</span>
          </h1>
        </div>

        {/* Subheading */}
        <p
          className="mt-6 max-w-2xl text-base text-white/50 sm:text-lg"
          style={{ animation: "tv-fade-in-up 0.5s ease-out 0.5s both" }}
        >
          EigenTrust scoring meets confidential compute. Know who to trust
          &mdash; without revealing the score.
        </p>

        {/* Address query bar */}
        <div
          className="mt-10 w-full"
          style={{ maxWidth: 560, animation: "tv-fade-in-up 0.5s ease-out 0.65s both" }}
        >
          <div
            className="flex rounded-lg bg-white/[0.04] backdrop-blur-sm"
            style={{
              border: inputError
                ? "1px solid rgba(239,68,68,0.6)"
                : "1px solid rgba(255,255,255,0.2)",
              transition: "border-color 0.3s ease",
            }}
          >
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              placeholder="Enter any wallet address — 0x..."
              className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none"
            />
            <button
              onClick={handleQuery}
              className="m-1 rounded-md bg-[#84cc16] px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#a3e635] hover:shadow-[0_0_24px_rgba(132,204,22,0.3)]"
            >
              Query
            </button>
          </div>
          <p className="mt-3 text-xs text-white/30">
            No wallet needed. Query any address instantly.
          </p>
        </div>

        {/* Stat pills */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          style={{ animation: "tv-fade-in 0.5s ease-out 0.85s both" }}
        >
          <StatPill label="16K+ Addresses Scored" />
          <StatPill label="EigenTrust + AgentRank" />
          <StatPill label="Powered by Inco Lightning" />
        </div>

        {/* Demo addresses */}
        <div className="mt-14 w-full" style={{ maxWidth: 720 }}>
          <DemoModeSection
            onSelect={(addr) => {
              setAddress(addr);
              router.push(`/query?address=${encodeURIComponent(addr)}`);
            }}
          />
        </div>
      </div>
    </section>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/40">
      <span className="h-1.5 w-1.5 rounded-full bg-[#84cc16]" />
      {label}
    </div>
  );
}
