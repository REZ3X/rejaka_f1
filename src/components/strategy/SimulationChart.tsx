"use client";

import { TIRE_COMPOUNDS } from "@/lib/constants";
import type { SimulatedLap } from "@/lib/types";
import { formatLapTime } from "@/lib/utils";
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

interface SimulationChartProps {
  simulatedLaps: SimulatedLap[];
  realLapTimesMs: number[];
  title?: string;
}

export default function SimulationChart({
  simulatedLaps,
  realLapTimesMs,
  title = "Real vs Simulated Lap Times",
}: SimulationChartProps) {
  if (simulatedLaps.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center py-20">
        <p className="text-text-muted">
          Configure a strategy to see simulation results
        </p>
      </div>
    );
  }

  const chartData = simulatedLaps.map((sl, i) => ({
    lap: sl.lap,
    simulated: sl.time,
    real: realLapTimesMs[i] ?? null,
    compound: sl.compound,
    isPitLap: sl.isPitLap,
  }));

  // Y-axis domain
  const allTimes = [
    ...simulatedLaps.map((l) => l.time),
    ...realLapTimesMs,
  ].filter((t) => t > 0);
  const sorted = [...allTimes].sort((a, b) => a - b);
  const p5 = sorted[Math.floor(sorted.length * 0.05)] ?? 60000;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 120000;
  const margin = (p95 - p5) * 0.15;

  // Find pit laps for reference lines
  const pitLaps = simulatedLaps
    .filter((l) => l.isPitLap)
    .map((l) => l.lap);

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
              const lapData = chartData.find((d) => d.lap === label);
              return (
                <div className="rounded-lg border border-border-primary bg-bg-card p-3 shadow-lg">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-secondary">
                      Lap {label}
                    </span>
                    {lapData && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          color: TIRE_COMPOUNDS[lapData.compound].color,
                          backgroundColor:
                            TIRE_COMPOUNDS[lapData.compound].bgColor,
                        }}
                      >
                        {TIRE_COMPOUNDS[lapData.compound].label}
                      </span>
                    )}
                    {lapData?.isPitLap && (
                      <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                        PIT
                      </span>
                    )}
                  </div>
                  {payload.map((entry) => (
                    <div
                      key={String(entry.dataKey)}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span style={{ color: entry.color }}>
                        {entry.dataKey === "simulated"
                          ? "Simulated"
                          : "Real"}
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
          <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />

          {/* Pit stop markers */}
          {pitLaps.map((lap) => (
            <ReferenceLine
              key={`pit-${lap}`}
              x={lap}
              stroke="#facc15"
              strokeDasharray="4 4"
              opacity={0.6}
              label={{
                value: "PIT",
                position: "top",
                style: {
                  fill: "#facc15",
                  fontSize: 10,
                  fontWeight: 600,
                },
              }}
            />
          ))}

          {/* Real lap times line */}
          <Line
            type="monotone"
            dataKey="real"
            name="Real"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />

          {/* Simulated lap times line */}
          <Line
            type="monotone"
            dataKey="simulated"
            name="Simulated"
            stroke="var(--f1-red)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "var(--f1-red)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
