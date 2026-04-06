import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// ENS lives on Ethereum mainnet, not Base. Use a public RPC -- no API key.
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum.publicnode.com"),
});

export interface ENSResolution {
  address: string;
  ens: string | null;
}

export function isENSName(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  // Anything with a dot that isn't a 0x address is treated as ENS.
  return trimmed.includes(".") && !trimmed.toLowerCase().startsWith("0x");
}

function isAddressFormat(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Resolve an input that may be an ENS name or a raw address.
 *
 * - ENS name -> forward resolve to address (and keep the ens label)
 * - Raw address -> reverse lookup for an ens name (best-effort)
 *
 * Failures are non-fatal: returns the raw input with ens: null.
 */
export async function resolveENS(input: string): Promise<ENSResolution> {
  const trimmed = input.trim();

  if (isENSName(trimmed)) {
    try {
      const address = await mainnetClient.getEnsAddress({
        name: trimmed.toLowerCase(),
      });
      if (address && isAddressFormat(address)) {
        return { address, ens: trimmed.toLowerCase() };
      }
      return { address: trimmed, ens: null };
    } catch {
      return { address: trimmed, ens: null };
    }
  }

  if (isAddressFormat(trimmed)) {
    try {
      const ensName = await mainnetClient.getEnsName({
        address: trimmed as `0x${string}`,
      });
      return { address: trimmed, ens: ensName ?? null };
    } catch {
      return { address: trimmed, ens: null };
    }
  }

  return { address: trimmed, ens: null };
}
