"use client";

interface TechCard {
  icon: string;
  name: string;
  description: string;
}

const TECH_STACK: TechCard[] = [
  {
    icon: "\uD83D\uDD78\uFE0F",
    name: "Neo4j Aura",
    description: "Graph database storing address attestation network",
  },
  {
    icon: "\u26A1",
    name: "Inco Lightning",
    description: "FHE coprocessor enabling encrypted on-chain trust scores",
  },
  {
    icon: "\uD83D\uDD17",
    name: "Intuition Protocol",
    description: "Decentralized attestation graph powering trust signals",
  },
  {
    icon: "\uD83C\uDF10",
    name: "Base Sepolia",
    description: "L2 testnet for contract deployment and on-chain activity",
  },
  {
    icon: "\uD83E\uDD16",
    name: "MCP Protocol",
    description: "AI-native transport layer for trust score queries",
  },
  {
    icon: "\u2699\uFE0F",
    name: "EigenTrust",
    description: "Iterative trust propagation algorithm with sybil resistance",
  },
];

export function TechStackGrid() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div
          className="mb-10 text-center"
          style={{ animation: "tv-fade-in-up 0.5s ease-out both" }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#84cc16]">
            Under the Hood
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tech Stack
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((card, i) => (
            <div
              key={card.name}
              className="group rounded-xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]"
              style={{
                animation: `tv-fade-in-up 0.5s ease-out ${i * 0.08}s both`,
              }}
            >
              <span className="text-2xl leading-none" role="img" aria-label={card.name}>
                {card.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white">{card.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
