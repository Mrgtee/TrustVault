import { QueryPage } from "@/components/trust/QueryPage";

interface QueryRouteProps {
  searchParams: { address?: string };
}

export default function QueryRoute({ searchParams }: QueryRouteProps) {
  return <QueryPage address={searchParams.address ?? ""} />;
}
