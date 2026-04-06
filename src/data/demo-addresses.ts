export type DemoTier = "high" | "medium" | "low";

export interface DemoAddress {
  label: string;
  address: string;
  tier: DemoTier;
  description: string;
  ens?: string | null;
}

export const DEMO_ADDRESSES: DemoAddress[] = [
  {
    label: "Vitalik Buterin",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    tier: "high",
    description: "100k+ attestations across Ethereum ecosystem",
    ens: "vitalik.eth",
  },
  {
    label: "Core Builder",
    address: "0x5B3bFfC0bcF8D4cAEC873fDcF719F60725767c98",
    tier: "high",
    description: "Well-attested builder with deep protocol contributions",
    ens: null,
  },
  {
    label: "Active Trader",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    tier: "medium",
    description: "Heavy DeFi activity, moderate graph presence",
    ens: null,
  },
  {
    label: "Exchange Wallet",
    address: "0x28C6c06298d514Db089934071355E5743bf21d60",
    tier: "medium",
    description: "High volume custodial wallet with mixed attestations",
    ens: null,
  },
  {
    label: "Burn Address",
    address: "0x000000000000000000000000000000000000dead",
    tier: "low",
    description: "No attestations, no activity graph presence",
    ens: null,
  },
];
