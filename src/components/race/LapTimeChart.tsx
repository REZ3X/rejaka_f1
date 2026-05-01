"use client";

import { TIRE_COMPOUNDS } from "@/lib/constants";
import type { PitStop } from "@/lib/types";
import { formatLapTime, getTeamColor } from "@/lib/utils";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DriverLap {
  lap: number;
  time: number;
  position: number;
}

interface DriverData {
  driverId: string;
  code: string;
  constructorId: string;
  laps: DriverLap[];
}

interface LapTimeChartProps {
  drivers: DriverData[];
  pitStops?: PitStop[];
  selectedDrivers: string[];
  title?: string;
}

export default function LapTimeChart({
  drivers,
  pitStops = [],
  selectedDrivers,
  title = "Lap Times",
}: LapTimeChartProps) {
  // Build chart data: each row is a lap, with a column per driver
  const visibleDrivers = drivers.filter((d) =>
    selectedDrivers.includes(d.driverId),
  );

  if (visibleDrivers.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center py-20">
        <p className="text-text-muted">Select drivers to view lap times</p>
      </div>
    );
  }

  const maxLaps = Math.max(...visibleDrivers.map((d) => d.laps.length));
  const chartData = [];

  for (let i = 0; i < maxLaps; i++) {
    const row: Record<string, number | string> = { lap: i + 1 };
    for (const driver of visibleDrivers) {
      const lapData = driver.laps[i];
      if (lapData) {
        row[driver.driverId] = lapData.time;
      }
    }
    chartData.push(row);
  }

  // Get pit stop laps for reference lines
  const pitLapLines: { lap: number; driverId: string }[] = [];
  for (const ps of pitStops) {
    if (selectedDrivers.includes(ps.driverId)) {
      pitLapLines.push({ lap: Number(ps.lap), driverId: ps.driverId });
    }
  }

  // Calculate Y-axis domain (filter outliers like pit laps)
  const allTimes = visibleDrivers.flatMap((d) => d.laps.map((l) => l.time));
  const sorted = [...allTimes].sort((a, b) => a - b);
  const p5 = sorted[Math.floor(sorted.length * 0.02)] ?? 60000;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 120000;
  const margin = (p95 - p5) * 0.1;

  return (
    <div className="chart-container">
      <h3 className="mb-4 text-sm font-semibold text-text-secondary">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-subtle)"
            opacity={0.5}
          />
          <XAxis
            dataKey="lap"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            label={{
              value: "Lap",
              position: "insideBottom",
              offset: -5,
              style: { fill: "var(--text-muted)", fontSize: 11 },
            }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            domain={[p5 - margin, p95 + margin]}
            tickFormatter={(v: number) => formatLapTime(v)}
            width={72}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-border-primary bg-bg-card p-3 shadow-lg">
                  <p className="mb-2 text-xs font-semibold text-text-secondary">
                    Lap {label}
                  </p>
                  {payload.map((entry) => (
                    <div
                      key={String(entry.dataKey)}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span
                        className="flex items-center gap-1.5"
                        style={{ color: entry.color }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        {visibleDrivers.find(
                          (d) => d.driverId === entry.dataKey,
                        )?.code ?? String(entry.dataKey)}
                      </span>
                      <span className="font-mono text-text-primary">
                        {formatLapTime(entry.value as number)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
            formatter={(value: string) =>
              visibleDrivers.find((d) => d.driverId === value)?.code ?? value
            }
          />

          {/* Pit stop reference lines */}
          {pitLapLines.map((pl) => (
            <ReferenceLine
              key={`pit-${pl.driverId}-${pl.lap}`}
              x={pl.lap}
              stroke={getTeamColor(
                visibleDrivers.find((d) => d.driverId === pl.driverId)
                  ?.constructorId ?? "default",
              )}
              strokeDasharray="4 4"
              opacity={0.4}
            />
          ))}

          {/* Driver lines */}
          {visibleDrivers.map((driver) => (
            <Line
              key={driver.driverId}
              type="monotone"
              dataKey={driver.driverId}
              stroke={getTeamColor(driver.constructorId)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
