"use client";

import ShareButton from "@/components/strategy/ShareButton";
import SimulationChart from "@/components/strategy/SimulationChart";
import SmartInsights from "@/components/strategy/SmartInsights";
import StrategyConfigurator from "@/components/strategy/StrategyConfigurator";
import TimeDeltaChart from "@/components/strategy/TimeDeltaChart";
import Select from "@/components/ui/Select";
import { CardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import {
  useRaceDrivers,
  useRaceLaps,
  useRaceResults,
} from "@/hooks/useRaceDetail";
import { useRaces } from "@/hooks/useRaces";
import { useGlobalSeason } from "@/hooks/useGlobalSeason";
import { useSimulation } from "@/hooks/useSimulation";
import { SEASONS } from "@/lib/constants";
import { formatGap, formatLapTime, getTeamColor } from "@/lib/utils";
import { FlaskConical, TrendingDown, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function StrategyLabContent() {
  const searchParams = useSearchParams();
  const [globalSeason, setGlobalSeason] = useGlobalSeason();
  const initialSeason = searchParams.get("season") || globalSeason;
  const initialRound = searchParams.get("round") || "";

  const initialDriver = searchParams.get("driver") || "";

  const [season, setSeason] = useState(initialSeason);
  const [round, setRound] = useState(initialRound);
  const [driverId, setDriverId] = useState(initialDriver);

  // Sync internal state if global changes (unless we got initialized by query param)
  useEffect(() => {
    if (!searchParams.get("season")) {
      setSeason(globalSeason);
    }
  }, [globalSeason, searchParams]);

  const handleSeasonChange = (s: string) => {
    setSeason(s);
    setGlobalSeason(s);
    setRound("");
    setDriverId("");
  };

  // Fetch strategy from DB if sid is present
  useEffect(() => {
    const sid = searchParams.get("sid");
    if (!sid) return;

    fetch(`/api/strategy/${sid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSeason(data.season);
          setRound(data.round);
          setDriverId(data.driverId);
        }
      })
      .catch((err) => console.error("Failed to fetch shared strategy", err));
  }, [searchParams]);

  const { races, isLoading: racesLoading } = useRaces(season);
  const { results, isLoading: resultsLoading } = useRaceResults(season, round);
  const { laps, isLoading: lapsLoading } = useRaceLaps(season, round);
  const { drivers, isLoading: driversLoading } = useRaceDrivers(season, round);

  // Total laps from results
  const totalLaps = results.length > 0 ? Number(results[0].laps) : 57;

  // Auto-select first driver
  useEffect(() => {
    if (drivers.length > 0 && !driverId) {
      setDriverId(drivers[0].driverId);
    }
  }, [drivers, driverId]);

  // Auto-select first round
  useEffect(() => {
    if (races.length > 0 && !round) {
      setRound(races[0].round);
    }
  }, [races, round]);

  const { stops, setStops, simulation, realLapTimesMs, baseLapTime } =
    useSimulation(driverId, season, round, laps, totalLaps);

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
  const selectedDriver = drivers.find((d) => d.driverId === driverId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center bg-f1-red text-white skew-btn shadow-[0_0_15px_rgba(225,6,0,0.3)]">
              <FlaskConical className="h-7 w-7 skew-btn" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-text-primary sm:text-4xl heading-font drop-shadow-md">
                STRATEGY <span className="text-f1-red">LAB</span>
              </h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-text-secondary">
                Simulation & Telemetry Module
              </p>
            </div>
          </div>
          <div className="ml-auto">
            {simulation && (
              <ShareButton
                config={{
                  season,
                  round,
                  driverId,
                  totalLaps,
                  stops,
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Left panel: Controls */}
        <div className="space-y-6">
          {/* Race selection */}
          <div className="glass-card overflow-visible p-6 space-y-5 border-l-4 border-l-f1-red">
            <h2 className="text-sm font-black uppercase italic tracking-widest text-text-primary heading-font border-b border-border-subtle pb-2">
              Parameters
            </h2>
            <Select
              id="strategy-season"
              label="Season"
              options={seasonOptions}
              value={season}
              onChange={handleSeasonChange}
            />
            <Select
              id="strategy-race"
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
              id="strategy-driver"
              label="Driver"
              options={driverOptions}
              value={driverId}
              onChange={setDriverId}
              placeholder={driversLoading ? "Loading..." : "Select driver..."}
            />
            {selectedDriver && (
              <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-primary/50 px-3 py-2">
                <span
                  className="h-3 w-1 rounded-full"
                  style={{
                    backgroundColor: getTeamColor(selectedDriver.constructorId),
                  }}
                />
                <span className="text-sm text-text-secondary">
                  {selectedDriver.constructorName}
                </span>
                <span className="ml-auto font-mono text-xs text-text-muted">
                  {totalLaps} laps
                </span>
              </div>
            )}
          </div>

          {/* Strategy configurator */}
          <div className="glass-card p-6 border-l-4 border-l-bull-yellow">
            <h2 className="mb-5 text-sm font-black uppercase italic tracking-widest text-text-primary heading-font border-b border-border-subtle pb-2">
              Configuration
            </h2>
            {isDataLoading ? (
              <div className="space-y-3">
                <CardSkeleton />
              </div>
            ) : (
              <StrategyConfigurator
                stops={stops}
                totalLaps={totalLaps}
                onStopsChange={setStops}
              />
            )}
          </div>

          {/* Results summary */}
          {simulation && (
            <div className="glass-card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                Simulation Results
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Simulated Total
                  </span>
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {formatLapTime(simulation.totalTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Real Total
                  </span>
                  <span className="font-mono text-sm text-text-muted">
                    {formatLapTime(simulation.realTotalTime)}
                  </span>
                </div>
                <div className="h-px bg-border-subtle" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Delta</span>
                  <span
                    className={`flex items-center gap-1 font-mono text-sm font-bold ${
                      simulation.timeDelta <= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {simulation.timeDelta <= 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    {formatGap(simulation.timeDelta)}
                  </span>
                </div>

                {/* Stint breakdown */}
                <div className="h-px bg-border-subtle" />
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase">
                    Stints
                  </span>
                  {simulation.stints.map((stint, i) => (
                    <div
                      key={`stint-${stint.startLap}`}
                      className="mt-2 flex items-center justify-between text-sm"
                    >
                      <span className="text-text-secondary">
                        Stint {i + 1}: L{stint.startLap}–L{stint.endLap}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          color:
                            stint.compound === "soft"
                              ? "#ff3333"
                              : stint.compound === "medium"
                                ? "#ffc700"
                                : "#cccccc",
                          backgroundColor:
                            stint.compound === "soft"
                              ? "rgba(255,51,51,0.15)"
                              : stint.compound === "medium"
                                ? "rgba(255,199,0,0.15)"
                                : "rgba(255,255,255,0.08)",
                        }}
                      >
                        {stint.compound.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Smart Insights */}
          {simulation && (
            <SmartInsights
              config={{
                season,
                round,
                driverId,
                totalLaps,
                stops,
              }}
              baseLapTimeMs={baseLapTime}
              realLapTimesMs={realLapTimesMs}
              simulation={simulation}
            />
          )}
        </div>

        {/* Right panel: Charts */}
        <div className="space-y-6">
          {isDataLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton height={200} />
            </>
          ) : simulation ? (
            <>
              <SimulationChart
                simulatedLaps={simulation.laps}
                realLapTimesMs={realLapTimesMs}
              />
              <TimeDeltaChart
                simulatedTimesMs={simulation.laps.map((l) => l.time)}
                realTimesMs={realLapTimesMs}
              />
            </>
          ) : (
            <div className="chart-container flex items-center justify-center py-32">
              <div className="text-center">
                <FlaskConical className="mx-auto mb-3 h-12 w-12 text-text-muted/30" />
                <p className="text-lg font-medium text-text-muted">
                  Select a race and driver to start
                </p>
                <p className="mt-1 text-sm text-text-muted/70">
                  Configure pit stops on the left panel
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StrategyLabPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="space-y-4">
            <CardSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      }
    >
      <StrategyLabContent />
    </Suspense>
  );
}
