"use client";

import ComparisonView from "@/components/strategy/ComparisonView";
import StrategyPanel from "@/components/strategy/StrategyPanel";
import Select from "@/components/ui/Select";
import { CardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import {
  useRaceDrivers,
  useRaceLaps,
  useRaceResults,
} from "@/hooks/useRaceDetail";
import { useGlobalSeason } from "@/hooks/useGlobalSeason";
import { useRaces } from "@/hooks/useRaces";
import { useSimulation } from "@/hooks/useSimulation";
import { SEASONS } from "@/lib/constants";
import { Gauge } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

function CompareContent() {
  const [globalSeason, setGlobalSeason] = useGlobalSeason();
  const [season, setSeason] = useState(globalSeason);
  const [round, setRound] = useState("");
  const [driverId, setDriverId] = useState("");

  // Sync internal state if global changes
  useEffect(() => {
    setSeason(globalSeason);
  }, [globalSeason]);

  const handleSeasonChange = (s: string) => {
    setSeason(s);
    setGlobalSeason(s);
    setRound("");
    setDriverId("");
  };

  const { races, isLoading: racesLoading } = useRaces(season);
  const { results, isLoading: resultsLoading } = useRaceResults(season, round);
  const { laps, isLoading: lapsLoading } = useRaceLaps(season, round);
  const { drivers, isLoading: driversLoading } = useRaceDrivers(season, round);

  const totalLaps = results.length > 0 ? Number(results[0].laps) : 57;

  useEffect(() => {
    if (drivers.length > 0 && !driverId) setDriverId(drivers[0].driverId);
  }, [drivers, driverId]);

  useEffect(() => {
    if (races.length > 0 && !round) setRound(races[0].round);
  }, [races, round]);

  // Two separate simulations
  const simA = useSimulation(driverId, season, round, laps, totalLaps);
  const simB = useSimulation(driverId, season, round, laps, totalLaps);

  const seasonOptions = SEASONS.map((s) => ({
    value: String(s),
    label: String(s),
  }));
  const raceOptions = races.map((r) => ({
    value: r.round,
    label: `R${r.round.padStart(2, "0")} – ${r.raceName}`,
  }));
  const driverOptions = drivers.map((d) => ({
    value: d.driverId,
    label: `${d.code} – ${d.givenName} ${d.familyName}`,
  }));

  const isDataLoading = lapsLoading || driversLoading || resultsLoading;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <Gauge className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Strategy Comparison
            </h1>
            <p className="mt-1 text-text-secondary">
              Pit two strategies against each other
            </p>
          </div>
        </div>
      </div>

      {/* Shared race selection */}
      <div className="glass-card mb-8 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Race & Driver
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            id="compare-season"
            label="Season"
            options={seasonOptions}
            value={season}
            onChange={handleSeasonChange}
          />
          <Select
            id="compare-race"
            label="Grand Prix"
            options={raceOptions}
            value={round}
            onChange={(v) => {
              setRound(v);
              setDriverId("");
            }}
            placeholder={racesLoading ? "Loading..." : "Select race..."}
          />
          <Select
            id="compare-driver"
            label="Driver"
            options={driverOptions}
            value={driverId}
            onChange={setDriverId}
            placeholder={driversLoading ? "Loading..." : "Select driver..."}
          />
        </div>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ChartSkeleton />
        </div>
      ) : (
        <>
          {/* Strategy panels side-by-side */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <StrategyPanel
              label="A"
              color="#e10600"
              stops={simA.stops}
              totalLaps={totalLaps}
              onStopsChange={simA.setStops}
              simulation={simA.simulation}
            />
            <StrategyPanel
              label="B"
              color="#3671C6"
              stops={simB.stops}
              totalLaps={totalLaps}
              onStopsChange={simB.setStops}
              simulation={simB.simulation}
            />
          </div>

          {/* Comparison charts */}
          {simA.simulation && simB.simulation ? (
            <ComparisonView
              strategyA={simA.simulation}
              strategyB={simB.simulation}
            />
          ) : (
            <div className="chart-container flex items-center justify-center py-20">
              <div className="text-center">
                <Gauge className="mx-auto mb-3 h-12 w-12 text-text-muted/30" />
                <p className="text-text-muted">
                  Configure both strategies to see comparison
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function StrategyComparePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <CardSkeleton />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
