"use client";

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Enter Address",
    description: "User inputs Ethereum address or ENS name",
  },
  {
    number: 2,
    title: "Graph Lookup",
    description:
      "Neo4j finds all attestations linked to this address across the Intuition graph",
  },
  {
    number: 3,
    title: "Score Computed",
    description:
      "EigenTrust propagates trust weights, AgentRank scores influence, 70/30 hybrid applied",
  },
  {
    number: 4,
    title: "MCP Response",
    description:
      "Trust MCP returns composite score, trust paths, sybil flag via SSE",
  },
  {
    number: 5,
    title: "FHE Encryption",
    description:
      "Score encrypted on-chain via Inco Lightning, stored as euint256, decryptable only by authorized wallets",
  },
];

function StepNode({ step, index }: { step: Step; index: number }) {
  return (
    <div
      className="flex flex-1 flex-col items-center text-center"
      style={{ animation: `tv-fade-in-up 0.5s ease-out ${0.2 + index * 0.1}s both` }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#84cc16]/30 bg-[#84cc16]/10 text-sm font-bold text-[#84cc16]">
        {step.number}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-white">{step.title}</h3>
      <p className="mt-1.5 max-w-[180px] text-xs leading-relaxed text-white/40">
        {step.description}
      </p>
    </div>
  );
}

function HorizontalConnector({ index }: { index: number }) {
  return (
    <div
      className="hidden flex-shrink-0 items-center lg:flex"
      style={{
        animation: `tv-fade-in 0.4s ease-out ${0.3 + index * 0.1}s both`,
        width: 40,
        marginTop: -28,
      }}
    >
      <svg width="40" height="2" className="text-white/20">
        <line
          x1="0"
          y1="1"
          x2="40"
          y2="1"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="8"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
    </div>
  );
}

function VerticalConnector({ index }: { index: number }) {
  return (
    <div
      className="flex items-center justify-center py-2 lg:hidden"
      style={{ animation: `tv-fade-in 0.4s ease-out ${0.3 + index * 0.1}s both` }}
    >
      <svg width="2" height="24" className="text-white/20">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="24"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="8"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
    </div>
  );
}

export function QueryLifecycle() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div
          className="mb-12 text-center"
          style={{ animation: "tv-fade-in-up 0.5s ease-out both" }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#84cc16]">
            Query Lifecycle
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            What happens when you query an address
          </h2>
        </div>

        {/* Desktop: horizontal layout */}
        <div className="hidden lg:flex lg:items-start lg:justify-between">
          {STEPS.map((step, i) => (
            <div key={step.number} className="contents">
              <StepNode step={step} index={i} />
              {i < STEPS.length - 1 && <HorizontalConnector index={i} />}
            </div>
          ))}
        </div>

        {/* Mobile/tablet: vertical layout */}
        <div className="flex flex-col items-center lg:hidden">
          {STEPS.map((step, i) => (
            <div key={step.number} className="w-full max-w-xs">
              <StepNode step={step} index={i} />
              {i < STEPS.length - 1 && <VerticalConnector index={i} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
