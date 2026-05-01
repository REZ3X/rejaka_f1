import type { Lap, PitStop, Race, RaceResult } from "@/lib/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useRaceResults(season: string, round: string) {
  const { data, error, isLoading } = useSWR<{
    race: Race;
    results: RaceResult[];
  }>(
    season && round ? `/api/race/${season}/${round}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  return {
    race: data?.race,
    results: data?.results ?? [],
    isLoading,
    error,
  };
}

export function useRaceLaps(season: string, round: string) {
  const { data, error, isLoading } = useSWR<{
    laps: Lap[];
    season: string;
    round: string;
  }>(
    season && round ? `/api/race/${season}/${round}/laps` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  return {
    laps: data?.laps ?? [],
    isLoading,
    error,
  };
}

interface DriverInfo {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  number: string;
  constructorId: string;
  constructorName: string;
  position: string;
  totalLaps: string;
  status: string;
}

export function useRaceDrivers(season: string, round: string) {
  const { data, error, isLoading } = useSWR<{
    drivers: DriverInfo[];
    pitStops: PitStop[];
  }>(
    season && round ? `/api/race/${season}/${round}/drivers` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  return {
    drivers: data?.drivers ?? [],
    pitStops: data?.pitStops ?? [],
    isLoading,
    error,
  };
}
