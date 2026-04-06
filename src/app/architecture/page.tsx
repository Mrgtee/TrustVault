import { ArchitectureDiagram } from "@/components/architecture/ArchitectureDiagram";
import { TechStackGrid } from "@/components/architecture/TechStackGrid";
import { QueryLifecycle } from "@/components/architecture/QueryLifecycle";

export const metadata = {
  title: "Architecture - TrustVault",
  description:
    "How TrustVault works: hybrid trust scoring with EigenTrust, Intuition Protocol, and Inco Lightning FHE encryption",
};

export default function ArchitecturePage() {
  return (
    <div className="relative">
      {/* Dot grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        {/* Page header */}
        <section className="px-4 pb-4 pt-16 sm:pt-20">
          <div
            className="mx-auto max-w-3xl text-center"
            style={{ animation: "tv-fade-in-up 0.6s ease-out both" }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[#84cc16]">
              System Architecture
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              How TrustVault Works
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/50">
              A hybrid trust scoring system combining on-chain graph attestations
              with confidential FHE encryption
            </p>
          </div>
        </section>

        <ArchitectureDiagram />

        <div className="mx-auto max-w-5xl px-4">
          <div className="border-t border-white/8" />
        </div>

        <QueryLifecycle />

        <div className="mx-auto max-w-5xl px-4">
          <div className="border-t border-white/8" />
        </div>

        <TechStackGrid />
      </div>
    </div>
  );
}
