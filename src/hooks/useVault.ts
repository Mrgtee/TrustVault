"use client";

import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { CONTRACT_ADDRESS } from "@/constants";
import { VAULT_ABI } from "@/lib/vaultAbi";

// IncoLightning executor address on Base Sepolia (from Lib.sol)
const INCO_LIGHTNING_ADDRESS =
  "0x168FDc3Ae19A5d5b03614578C58974FF30FCBe92" as const;

const INCO_FEE_ABI = [
  {
    name: "getFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export type VaultStatus =
  | "idle"
  | "encrypting"
  | "storing"
  | "checking"
  | "success"
  | "error";

export function useVault() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<VaultStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [hasStoredScore, setHasStoredScore] = useState(false);
  const [accessResult, setAccessResult] = useState<boolean | null>(null);

  const encryptAndStore = async (score: number) => {
    if (!isConnected || !walletClient || !address) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setStatus("encrypting");
      setError("");
      setTxHash("");

      // Encrypt the score using Inco Lightning
      const { getIncoClient } = await import("@/lib/inco");
      const lightning = await getIncoClient();

      // handleType 8 = euint256 (matches the contract's encrypted type)
      const encryptedInput = await lightning.encrypt(score, {
        accountAddress: address,
        dappAddress: CONTRACT_ADDRESS as `0x${string}`,
        handleType: 8,
      });

      setStatus("storing");

      // Query the current Inco fee on-chain (e.newEuint256 forwards this to IncoLightning)
      const incoFee = await publicClient!.readContract({
        address: INCO_LIGHTNING_ADDRESS,
        abi: INCO_FEE_ABI,
        functionName: "getFee",
      });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "storeEncryptedScore",
        args: [encryptedInput as `0x${string}`],
        value: incoFee,
        chain: baseSepolia,
      });

      setTxHash(hash);

      // Wait for confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setHasStoredScore(true);
      setStatus("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Transaction failed";
      console.error("Vault error:", err);
      setError(message);
      setStatus("error");
    }
  };

  const checkAccess = async () => {
    if (!isConnected || !walletClient || !address) return;

    try {
      setStatus("checking");
      setError("");

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "checkAccess",
        args: [],
        chain: baseSepolia,
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Read the result
      const result = await publicClient?.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "accessGranted",
        args: [address],
      });

      setAccessResult(result as boolean);
      setStatus("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Check access failed";
      setError(message);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError("");
    setTxHash("");
    setAccessResult(null);
  };

  return {
    status,
    txHash,
    error,
    hasStoredScore,
    accessResult,
    isConnected,
    address,
    encryptAndStore,
    checkAccess,
    reset,
  };
}
