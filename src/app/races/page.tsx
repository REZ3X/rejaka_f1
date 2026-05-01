"use client";

import RaceCard from "@/components/race/RaceCard";
import SeasonSelector from "@/components/race/SeasonSelector";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useRaces } from "@/hooks/useRaces";
import { useGlobalSeason } from "@/hooks/useGlobalSeason";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function RaceExplorerPage() {
  const [globalSeason, setGlobalSeason] = useGlobalSeason();
  const [season, setSeason] = useState(globalSeason);
  const [search, setSearch] = useState("");

  // Sync internal state if global changes
  useEffect(() => {
    setSeason(globalSeason);
  }, [globalSeason]);

  const handleSeasonChange = (s: string) => {
    setSeason(s);
    setGlobalSeason(s);
  };

  const { races, isLoading, error } = useRaces(season);

  const filtered = races.filter(
    (race) =>
      race.raceName.toLowerCase().includes(search.toLowerCase()) ||
      race.Circuit.circuitName.toLowerCase().includes(search.toLowerCase()) ||
      race.Circuit.Location.country
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
          Race Explorer
        </h1>
        <p className="mt-2 text-text-secondary">
          Browse Grand Prix races and dive into lap-by-lap data
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:w-40">
          <SeasonSelector value={season} onChange={handleSeasonChange} />
        </div>
        <div className="relative flex-1">
          <label
            htmlFor="race-search"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="race-search"
              type="text"
              placeholder="Search races, circuits, countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border-primary bg-bg-card py-2.5 pr-4 pl-10 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-f1-red/40"
            />
          </div>
        </div>
        <div className="text-sm text-text-muted self-end pb-1">
          {filtered.length} race{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
          Failed to load races. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={`skel-${i}`} />
          ))}
        </div>
      )}

      {/* Race grid */}
      {!isLoading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((race, idx) => (
            <RaceCard
              key={`${race.season}-${race.round}`}
              race={race}
              index={idx}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg text-text-muted">No races found</p>
          <p className="mt-1 text-sm text-text-muted">
            Try adjusting your search or selecting a different season
          </p>
        </div>
      )}
    </div>
  );
}
