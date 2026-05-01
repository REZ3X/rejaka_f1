import { CURRENT_SEASON } from "@/lib/constants";
import useSWR from "swr";

const STORAGE_KEY = "r-f1-selected-season";

export function useGlobalSeason() {
  const getInitialSeason = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    }
    return CURRENT_SEASON;
  };

  const { data, mutate } = useSWR(STORAGE_KEY, null, {
    fallbackData: getInitialSeason(),
  });

  const setSeason = (newSeason: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newSeason);
    }
    mutate(newSeason, false);
  };

  return [data || CURRENT_SEASON, setSeason] as const;
}
