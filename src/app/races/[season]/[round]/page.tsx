"use client";

import DriverSelector from "@/components/race/DriverSelector";
import LapTimeChart from "@/components/race/LapTimeChart";
import PositionChart from "@/components/race/PositionChart";
import RaceReplay from "@/components/race/RaceReplay";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { useRaceDrivers, useRaceLaps, useRaceResults } from "@/hooks/useRaceDetail";
import { parseLapTime, formatDate, formatLapTime, getCountryFlag, getTeamColor } from "@/lib/utils";
import { ArrowLeft, Clock, FlaskConical, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";

export default function RaceDetailPage({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = use(params);
  const { race, results, isLoading: resultsLoading } = useRaceResults(season, round);
  const { laps, isLoading: lapsLoading } = useRaceLaps(season, round);
  const { drivers, pitStops, isLoading: driversLoading } = useRaceDrivers(season, round);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  // Auto-select top 5 drivers when data loads
  useMemo(() => {
    if (drivers.length > 0 && selectedDrivers.length === 0) {
      setSelectedDrivers(drivers.slice(0, 5).map((d) => d.driverId));
    }
  }, [drivers, selectedDrivers.length]);

  // Build per-driver lap data for charts
  const driverLapData = useMemo(() => {
    if (!laps.length || !drivers.length) return [];

    return drivers.map((driver) => {
      const driverLaps = laps
        .map((lap) => {
          const timing = lap.Timings.find(
            (t) => t.driverId === driver.driverId,
          );
          if (!timing) return null;
          return {
            lap: Number(lap.number),
            time: parseLapTime(timing.time),
            position: Number(timing.position),
          };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null);

      return {
        driverId: driver.driverId,
        code: driver.code,
        constructorId: driver.constructorId,
        constructorName: driver.constructorName,
        givenName: driver.givenName,
        familyName: driver.familyName,
        laps: driverLaps,
      };
    });
  }, [laps, drivers]);

  const isLoading = resultsLoading || lapsLoading || driversLoading;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back nav */}
      <Link
        href="/races"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-f1-red"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to races
      </Link>

      {/* Race header */}
      {race && (
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center bg-bg-card skew-btn shadow-[0_0_15px_rgba(255,255,255,0.05)] border-l-4 border-l-f1-red">
              <span className="text-3xl skew-btn">
                {getCountryFlag(race.Circuit.Location.country)}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-f1-red uppercase tracking-widest heading-font">
                {season} · Round {round}
              </span>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-text-primary sm:text-4xl heading-font drop-shadow-md">
                {race.raceName}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-text-muted" />
              {race.Circuit.circuitName}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-text-muted" />
              {formatDate(race.date)}
            </span>
            <Link
              href={`/strategy?season=${season}&round=${round}`}
              className="flex items-center gap-1.5 text-f1-red hover:underline"
            >
              <FlaskConical className="h-4 w-4" />
              Open in Strategy Lab
            </Link>
          </div>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="glass-card mb-8 overflow-hidden border-t-4 border-t-f1-red">
          <div className="border-b border-border-subtle px-5 py-4 bg-bg-secondary">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase italic tracking-widest text-text-primary heading-font">
              <Trophy className="h-4 w-4 text-f1-red" />
              Race Results
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs font-bold uppercase tracking-widest text-text-muted heading-font bg-bg-primary/50">
                  <th className="px-5 py-3">Pos</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Team</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r.Driver.driverId}
                    className="border-b border-border-subtle/50 transition-colors hover:bg-bg-card-hover"
                  >
                    <td className="px-5 py-2.5 font-mono font-bold text-text-primary">
                      {r.position === "1" ? (
                        <span className="text-f1-red">P1</span>
                      ) : (
                        `P${r.position}`
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-1 rounded-full"
                          style={{
                            backgroundColor: getTeamColor(r.Constructor.constructorId),
                          }}
                        />
                        <span className="font-medium text-text-primary">
                          {r.Driver.givenName}{" "}
                          <span className="font-bold">{r.Driver.familyName}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-text-secondary">
                      {r.Constructor.name}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-text-secondary">
                      {r.Time?.time ?? r.status}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-text-muted">
                      {r.points !== "0" ? r.points : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver selector */}
      {drivers.length > 0 && (
        <div className="glass-card mb-8 p-5">
          <DriverSelector
            drivers={drivers}
            selected={selectedDrivers}
            onChange={setSelectedDrivers}
          />
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div className="space-y-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="space-y-6">
          <RaceReplay
            drivers={driverLapData}
            pitStops={pitStops}
            totalLaps={results.length > 0 ? Number(results[0].laps) : 57}
          />
          <LapTimeChart
            drivers={driverLapData}
            pitStops={pitStops}
            selectedDrivers={selectedDrivers}
            title="Lap Times"
          />
          <PositionChart
            drivers={driverLapData}
            selectedDrivers={selectedDrivers}
            title="Position Changes"
          />
        </div>
      )}
    </div>
  );
}
