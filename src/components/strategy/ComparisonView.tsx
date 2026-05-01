"use client";

import { formatGap, formatLapTime } from "@/lib/utils";
import type { SimulationResult } from "@/lib/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ComparisonViewProps {
  strategyA: SimulationResult;
  strategyB: SimulationResult;
}

export default function ComparisonView({
  strategyA,
  strategyB,
}: ComparisonViewProps) {
  const maxLaps = Math.max(strategyA.laps.length, strategyB.laps.length);

  // Lap time comparison data
  const lapData = Array.from({ length: maxLaps }, (_, i) => ({
    lap: i + 1,
    A: strategyA.laps[i]?.time ?? null,
    B: strategyB.laps[i]?.time ?? null,
  }));

  // Cumulative gap data (A - B at each lap)
  let cumA = 0;
  let cumB = 0;
  const gapData = Array.from({ length: maxLaps }, (_, i) => {
    cumA += strategyA.laps[i]?.time ?? 0;
    cumB += strategyB.laps[i]?.time ?? 0;
    return {
      lap: i + 1,
      gap: cumA - cumB,
    };
  });

  const finalGap = cumA - cumB;
  const winner = finalGap > 0 ? "B" : "A";
  const winnerColor = winner === "A" ? "#e10600" : "#3671C6";

  // Y-axis domain for lap times
  const allTimes = [
    ...strategyA.laps.map((l) => l.time),
    ...strategyB.laps.map((l) => l.time),
  ];
  const sorted = [...allTimes].sort((a, b) => a - b);
  const p5 = sorted[Math.floor(sorted.length * 0.05)] ?? 60000;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 120000;
  const margin = (p95 - p5) * 0.15;

  return (
    <div className="space-y-6">
      {/* Winner banner */}
      <div
        className="glass-card flex items-center justify-between p-5"
        style={{ borderColor: `${winnerColor}40` }}
      >
        <div>
          <p className="text-sm text-text-secondary">Winner</p>
          <p className="text-2xl font-bold" style={{ color: winnerColor }}>
            Strategy {winner}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary">Gap</p>
          <p className="font-mono text-2xl font-bold text-text-primary">
            {formatGap(Math.abs(finalGap))}
          </p>
        </div>
      </div>

      {/* Lap time comparison */}
      <div className="chart-container">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary">
          Lap Time Comparison
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lapData}>
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
                        <span style={{ color: entry.color }}>
                          Strategy {String(entry.dataKey)}
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
            <Line
              type="monotone"
              dataKey="A"
              name="Strategy A"
              stroke="#e10600"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="B"
              name="Strategy B"
              stroke="#3671C6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gap evolution */}
      <div className="chart-container">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary">
          Gap Evolution (A − B)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={gapData}>
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
              tickFormatter={(v: number) =>
                `${v > 0 ? "+" : ""}${(v / 1000).toFixed(1)}s`
              }
              width={60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const gap = payload[0].value as number;
                return (
                  <div className="rounded-lg border border-border-primary bg-bg-card p-3 shadow-lg">
                    <p className="mb-1 text-xs font-semibold text-text-secondary">
                      Lap {label}
                    </p>
                    <p className="text-sm">
                      <span className="text-text-secondary">
                        {gap > 0 ? "B leads by " : "A leads by "}
                      </span>
                      <span className="font-mono font-semibold text-text-primary">
                        {formatGap(Math.abs(gap))}
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            {/* Zero line */}
            <Line
              type="monotone"
              dataKey={() => 0}
              stroke="var(--text-muted)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="gap"
              name="Gap"
              stroke="#facc15"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex justify-center gap-6 text-xs text-text-muted">
          <span>↑ Positive = A is slower (B leads)</span>
          <span>↓ Negative = A is faster (A leads)</span>
        </div>
      </div>

      {/* Final comparison bars */}
      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary">
          Final Race Time
        </h3>
        <div className="space-y-3">
          {[
            { label: "A", time: strategyA.totalTime, color: "#e10600" },
            { label: "B", time: strategyB.totalTime, color: "#3671C6" },
          ].map((s) => {
            const maxTime = Math.max(
              strategyA.totalTime,
              strategyB.totalTime,
            );
            const minTime = Math.min(
              strategyA.totalTime,
              strategyB.totalTime,
            );
            const range = maxTime - minTime || 1;
            const barWidth =
              90 + ((maxTime - s.time) / range) * 10;

            return (
              <div key={s.label} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded text-xs font-black text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.label}
                </span>
                <div className="flex-1">
                  <div
                    className="h-6 rounded-md transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: `${s.color}30`,
                      border: `1px solid ${s.color}50`,
                    }}
                  />
                </div>
                <span className="min-w-[100px] text-right font-mono text-sm font-semibold text-text-primary">
                  {formatLapTime(s.time)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
