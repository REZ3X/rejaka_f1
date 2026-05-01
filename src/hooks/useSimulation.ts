"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { deriveBaseLapTime, simulateStrategy } from "@/lib/simulation";
import type { Lap, SimulationResult, TireCompound } from "@/lib/types";
import { parseLapTime } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface StopConfig {
  lap: number;
  compound: TireCompound;
}

export function useSimulation(
  driverId: string,
  season: string,
  round: string,
  laps: Lap[],
  totalLaps: number,
) {
  const searchParams = useSearchParams();

  const initialStops = useMemo(() => {
    // If we have sid, we will fetch it asynchronously, so initially return default
    const sid = searchParams.get("sid");
    if (sid) return [{ lap: Math.floor(totalLaps * 0.4) || 20, compound: "hard" as TireCompound }];

    const stopsParam = searchParams.get("stops");
    if (stopsParam) {
      try {
        return stopsParam.split(",").map(s => {
          const [lapStr, compound] = s.split("-");
          return { lap: Number(lapStr), compound: compound as TireCompound };
        });
      } catch (e) {
        // Fallback on error
      }
    }
    return [{ lap: Math.floor(totalLaps * 0.4) || 20, compound: "hard" as TireCompound }];
  }, [searchParams, totalLaps]);

  const [stops, setStops] = useState<StopConfig[]>(initialStops);

  // Fetch strategy from DB if sid is present
  useEffect(() => {
    const sid = searchParams.get("sid");
    if (!sid) return;

    fetch(`/api/strategy/${sid}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.stops) {
          setStops(data.stops);
        }
      })
      .catch(err => console.error("Failed to fetch strategy", err));
  }, [searchParams]);

  // Update when initialStops change (e.g. initial load or totalLaps becomes available)
  useEffect(() => {
    setStops(initialStops);
  }, [initialStops]);

  // Extract real lap times for the selected driver
  const realLapData = useMemo(() => {
    if (!driverId || !laps.length) return { times: [] as { lap: number; time: string }[], timesMs: [] as number[] };

    const times: { lap: number; time: string }[] = [];
    for (const lap of laps) {
      const timing = lap.Timings.find((t) => t.driverId === driverId);
      if (timing) {
        times.push({ lap: Number(lap.number), time: timing.time });
      }
    }

    const timesMs = times.map((t) => parseLapTime(t.time));
    return { times, timesMs };
  }, [driverId, laps]);

  // Derive base lap time
  const baseLapTime = useMemo(() => {
    if (!realLapData.times.length) return 90000;
    const pitLaps = stops.map((s) => s.lap);
    return deriveBaseLapTime(realLapData.times, pitLaps);
  }, [realLapData.times, stops]);

  // Run simulation
  const simulation: SimulationResult | null = useMemo(() => {
    if (!driverId || totalLaps === 0 || stops.length === 0) return null;

    const config = {
      season,
      round,
      driverId,
      totalLaps,
      stops,
    };

    return simulateStrategy(config, baseLapTime, realLapData.timesMs);
  }, [driverId, season, round, totalLaps, stops, baseLapTime, realLapData.timesMs]);

  const updateStops = useCallback((newStops: StopConfig[]) => {
    setStops(newStops);
  }, []);

  return {
    stops,
    setStops: updateStops,
    simulation,
    realLapTimesMs: realLapData.timesMs,
    baseLapTime,
  };
}
