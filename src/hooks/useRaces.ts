import type { Race } from "@/lib/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useRaces(season: string) {
  const { data, error, isLoading } = useSWR<{ races: Race[]; season: string }>(
    `/api/races?season=${season}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  return {
    races: data?.races ?? [],
    isLoading,
    error,
  };
}
