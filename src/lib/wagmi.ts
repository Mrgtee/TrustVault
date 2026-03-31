import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http("https://sepolia.base.org"),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    appName: "TrustVault",
    appDescription:
      "Confidential Trust Infrastructure powered by Inco Lightning",
  })
);

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
