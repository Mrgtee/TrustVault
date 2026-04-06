import type { Metadata } from "next";
import { QueryPage } from "@/components/trust/QueryPage";

export const metadata: Metadata = {
  title: "Trust Score Query - TrustVault",
  description:
    "Query any Ethereum address for a hybrid trust score powered by EigenTrust, Intuition Protocol, and Inco Lightning FHE encryption",
};

interface QueryRouteProps {
  searchParams: { address?: string };
}

export default function QueryRoute({ searchParams }: QueryRouteProps) {
  return <QueryPage address={searchParams.address ?? ""} />;
}
