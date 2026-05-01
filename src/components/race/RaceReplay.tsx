"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";
import { getTeamColor, formatLapTime } from "@/lib/utils";
import type { PitStop } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface DriverLap {
  lap: number;
  time: number;
  position: number;
}

interface DriverData {
  driverId: string;
  code: string;
  constructorId: string;
  constructorName: string;
  givenName: string;
  familyName: string;
  laps: DriverLap[];
}

interface RaceReplayProps {
  drivers: DriverData[];
  pitStops: PitStop[];
  totalLaps: number;
}

export default function RaceReplay({
  drivers,
  pitStops,
  totalLaps,
}: RaceReplayProps) {
  const [currentLap, setCurrentLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per lap

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentLap < totalLaps) {
      interval = setInterval(() => {
        setCurrentLap((prev) => Math.min(prev + 1, totalLaps));
      }, speed);
    } else if (currentLap >= totalLaps) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLap, totalLaps, speed]);

  const togglePlay = () => {
    if (currentLap >= totalLaps) {
      setCurrentLap(1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLap(Number(e.target.value));
    setIsPlaying(false);
  };

  // Get current lap data
  const currentStandings = drivers
    .map((driver) => {
      const lapData = driver.laps.find((l) => l.lap === currentLap);
      const isPitting = pitStops.some(
        (ps) => ps.driverId === driver.driverId && Number(ps.lap) === currentLap
      );
      
      // Calculate positions gained/lost since lap 1
      const lap1Data = driver.laps.find((l) => l.lap === 1);
      const startPos = lap1Data ? lap1Data.position : 0;
      const posDiff = lapData && startPos ? startPos - lapData.position : 0;

      return {
        ...driver,
        currentPos: lapData?.position ?? 999,
        lastLapTime: lapData?.time ?? 0,
        isPitting,
        posDiff,
      };
    })
    .filter((d) => d.currentPos !== 999)
    .sort((a, b) => a.currentPos - b.currentPos);

  if (drivers.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Race Replay</h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold text-f1-red">
              LAP {currentLap} <span className="text-text-muted text-sm">/ {totalLaps}</span>
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-f1-red text-white transition-transform hover:scale-105"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
          </button>
          
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentLap(1);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-card-hover text-text-secondary transition-colors hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setSpeed((prev) => (prev === 1000 ? 500 : prev === 500 ? 250 : 1000))}
            className="flex h-10 w-auto px-3 items-center justify-center rounded-full bg-bg-card-hover text-text-secondary transition-colors hover:text-text-primary text-sm font-medium gap-1"
          >
            <FastForward className="h-4 w-4" />
            {1000 / speed}x
          </button>

          <input
            type="range"
            min={1}
            max={totalLaps}
            value={currentLap}
            onChange={handleSliderChange}
            className="flex-1 h-2 rounded-full appearance-none bg-border-subtle accent-f1-red"
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-card-hover text-left text-xs uppercase tracking-wider text-text-muted">
              <th className="px-5 py-3 w-16">Pos</th>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Last Lap</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {currentStandings.slice(0, 10).map((driver) => (
                <motion.tr
                  key={driver.driverId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="border-b border-border-subtle/30"
                >
                  <td className="px-5 py-3 font-mono font-bold">
                    <div className="flex items-center gap-2">
                      P{driver.currentPos}
                      {driver.posDiff > 0 && (
                        <span className="text-emerald-500 text-xs flex items-center">
                          ▲{driver.posDiff}
                        </span>
                      )}
                      {driver.posDiff < 0 && (
                        <span className="text-red-500 text-xs flex items-center">
                          ▼{Math.abs(driver.posDiff)}
                        </span>
                      )}
                      {driver.posDiff === 0 && (
                        <span className="text-text-muted text-xs w-4 text-center">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-1 rounded-full"
                        style={{ backgroundColor: getTeamColor(driver.constructorId) }}
                      />
                      <span className="font-semibold text-text-primary">
                        {driver.code}
                      </span>
                      <span className="text-text-muted hidden sm:inline">
                        {driver.familyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-text-secondary">
                    {driver.lastLapTime > 0 ? formatLapTime(driver.lastLapTime) : "-"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {driver.isPitting && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-500"
                      >
                        IN PIT
                      </motion.span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        <div className="px-5 py-3 text-center text-xs text-text-muted bg-bg-card-hover/50">
          Showing Top 10 Drivers
        </div>
      </div>
    </div>
  );
}
