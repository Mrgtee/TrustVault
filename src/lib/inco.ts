import { Lightning } from "@inco/js/lite";
import { CHAIN_ID } from "@/constants";

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

let clientPromise: ReturnType<typeof Lightning.custom> | null = null;

async function initLightning() {
  if (typeof window === "undefined") {
    throw new Error("Lightning client can only be initialized in the browser");
  }

  const deployment = Lightning.latestDeployment("testnet", CHAIN_ID);

  // Use custom() with explicit hostChainRpcUrl to avoid the default http()
  // transport resolution in Lightning.at(), which can fail with
  // "incoVerifier() Failed to fetch" in browser contexts.
  return Lightning.custom({
    executorAddress: deployment.executorAddress,
    chainId: CHAIN_ID,
    covalidatorUrls: [
      `https://${deployment.executorAddress.toLowerCase()}.${CHAIN_ID}.${deployment.pepper}.inco.org`,
    ],
    hostChainRpcUrl: BASE_SEPOLIA_RPC,
  });
}

export function getIncoClient() {
  if (typeof window === "undefined") {
    throw new Error("getIncoClient must be called from the browser");
  }

  if (!clientPromise) {
    clientPromise = initLightning().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}
