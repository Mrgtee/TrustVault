"use client";

interface LayerBox {
  title: string;
  details: string[];
}

interface Layer {
  number: number;
  label: string;
  borderColor: string;
  glowColor: string;
  boxes: LayerBox[];
  subLabel?: string;
  splitBar?: { left: number; right: number; leftLabel: string; rightLabel: string };
}

const LAYERS: Layer[] = [
  {
    number: 1,
    label: "Layer 1: Trust Data Sources",
    borderColor: "rgba(132,204,22,0.4)",
    glowColor: "rgba(132,204,22,0.06)",
    boxes: [
      {
        title: "Intuition Protocol Graph",
        details: ["16,445 addresses", "16,996 attestations", "Neo4j Aura"],
      },
      {
        title: "Base Sepolia Activity",
        details: ["On-chain transactions", "Contract interactions", "Wallet age"],
      },
    ],
  },
  {
    number: 2,
    label: "Layer 2: Hybrid Scoring Engine",
    borderColor: "rgba(234,179,8,0.4)",
    glowColor: "rgba(234,179,8,0.06)",
    boxes: [
      {
        title: "EigenTrust + AgentRank",
        details: [
          "Iterative trust propagation",
          "Sybil resistance",
          "Multi-hop trust paths",
        ],
      },
    ],
    subLabel: "70% Intuition Graph Weight + 30% On-Chain Activity",
    splitBar: {
      left: 70,
      right: 30,
      leftLabel: "Intuition Graph",
      rightLabel: "On-Chain",
    },
  },
  {
    number: 3,
    label: "Layer 3: MCP API Layer",
    borderColor: "rgba(59,130,246,0.4)",
    glowColor: "rgba(59,130,246,0.06)",
    boxes: [
      {
        title: "Trust MCP Server",
        details: [
          "mcp-trust.intuition.box",
          "SSE transport",
          "Proxied via /api/trust-score",
        ],
      },
    ],
  },
  {
    number: 4,
    label: "Layer 4: Confidential Smart Contract",
    borderColor: "rgba(168,85,247,0.4)",
    glowColor: "rgba(168,85,247,0.06)",
    boxes: [
      {
        title: "ConfidentialTrustVault.sol",
        details: [
          "Inco Lightning FHE coprocessor",
          "Base Sepolia (0xaa3A...0067)",
          "euint64 encrypted scores",
          "FHE.asEuint64() + requestDecrypt",
        ],
      },
    ],
  },
  {
    number: 5,
    label: "Layer 5: Frontend Interface",
    borderColor: "rgba(255,255,255,0.3)",
    glowColor: "rgba(255,255,255,0.03)",
    boxes: [
      {
        title: "Next.js 14 App",
        details: [
          "wagmi v2, viem v2, @inco/js",
          "ConnectKit wallet connection",
          "trust-vault-steel.vercel.app",
        ],
      },
    ],
  },
];

const ARROW_LABELS = [
  "Feeds into",
  "Exposes via",
  "Encrypts with",
  "Rendered by",
];

function ConnectorArrow({ label, index }: { label: string; index: number }) {
  return (
    <div
      className="flex flex-col items-center gap-1 py-3"
      style={{ animation: `tv-fade-in-up 0.4s ease-out ${0.3 + index * 0.15}s both` }}
    >
      <svg width="2" height="28" className="text-white/20">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="28"
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
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </span>
      <svg width="2" height="28" className="text-white/20">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="28"
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

function LayerCard({ layer, index }: { layer: Layer; index: number }) {
  const isSplit = layer.boxes.length > 1;

  return (
    <div
      className="w-full"
      style={{ animation: `tv-fade-in-up 0.5s ease-out ${0.15 + index * 0.12}s both` }}
    >
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/30">
        {layer.label}
      </p>
      <div
        className={`grid gap-3 ${isSplit ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {layer.boxes.map((box) => (
          <div
            key={box.title}
            className="rounded-xl p-5 backdrop-blur-sm"
            style={{
              background: layer.glowColor,
              border: `1px solid ${layer.borderColor}`,
            }}
          >
            <h3 className="mb-2 text-sm font-bold text-white">{box.title}</h3>
            <ul className="space-y-1">
              {box.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-center gap-2 text-xs text-white/50"
                >
                  <span
                    className="h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: layer.borderColor }}
                  />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {layer.subLabel && (
        <p className="mt-3 text-center text-xs font-medium text-white/40">
          {layer.subLabel}
        </p>
      )}

      {layer.splitBar && (
        <div className="mx-auto mt-2 max-w-md">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="rounded-l-full bg-[#84cc16]/60"
              style={{ width: `${layer.splitBar.left}%` }}
            />
            <div
              className="rounded-r-full bg-[#eab308]/40"
              style={{ width: `${layer.splitBar.right}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-white/30">
            <span>{layer.splitBar.leftLabel} ({layer.splitBar.left}%)</span>
            <span>{layer.splitBar.rightLabel} ({layer.splitBar.right}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center">
          {LAYERS.map((layer, i) => (
            <div key={layer.number} className="w-full">
              <LayerCard layer={layer} index={i} />
              {i < LAYERS.length - 1 && (
                <ConnectorArrow label={ARROW_LABELS[i]} index={i} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
