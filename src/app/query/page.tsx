import type { Metadata } from "next";
import { QueryPage } from "@/components/trust/QueryPage";

export const metadata: Metadata = {
  title: "Query Trust Score",
  description:
    "Query any Ethereum address for a hybrid trust score powered by EigenTrust, Intuition Protocol, and Inco Lightning FHE encryption",
};

interface QueryRouteProps {
  searchParams: { address?: string; ens?: string };
}

export default function QueryRoute({ searchParams }: QueryRouteProps) {
  return (
    <QueryPage
      address={searchParams.address ?? ""}
      initialEns={searchParams.ens ?? null}
    />
  );
}
