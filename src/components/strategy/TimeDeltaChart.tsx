"use client";

import { formatGap } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeDeltaChartProps {
  simulatedTimesMs: number[];
  realTimesMs: number[];
  title?: string;
}

export default function TimeDeltaChart({
  simulatedTimesMs,
  realTimesMs,
  title = "Time Delta per Lap",
}: TimeDeltaChartProps) {
  const chartData = simulatedTimesMs.map((sim, i) => {
    const real = realTimesMs[i] ?? sim;
    const delta = sim - real;
    return {
      lap: i + 1,
      delta,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center py-20">
        <p className="text-text-muted">No data to display</p>
      </div>
    );
  }

  // Calculate total delta
  const totalDelta = chartData.reduce((sum, d) => sum + d.delta, 0);
  const maxAbsDelta = Math.max(...chartData.map((d) => Math.abs(d.delta)));

  return (
    <div className="chart-container">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">{title}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span className="text-text-muted">Faster</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-red-500" />
            <span className="text-text-muted">Slower</span>
          </span>
          <span
            className={`font-mono font-semibold ${
              totalDelta <= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            Total: {formatGap(totalDelta)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
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
            domain={[-maxAbsDelta * 1.1, maxAbsDelta * 1.1]}
            tickFormatter={(v: number) =>
              `${v > 0 ? "+" : ""}${(v / 1000).toFixed(1)}s`
            }
            width={52}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const delta = payload[0].value as number;
              return (
                <div className="rounded-lg border border-border-primary bg-bg-card p-3 shadow-lg">
                  <p className="mb-1 text-xs font-semibold text-text-secondary">
                    Lap {label}
                  </p>
                  <p
                    className={`font-mono text-sm font-semibold ${
                      delta <= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatGap(delta)}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="delta" radius={[2, 2, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.lap}`}
                fill={entry.delta <= 0 ? "#10b981" : "#ef4444"}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
