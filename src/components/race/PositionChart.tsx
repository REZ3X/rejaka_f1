"use client";

import { getTeamColor } from "@/lib/utils";
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

interface PositionChartProps {
  drivers: DriverData[];
  selectedDrivers: string[];
  title?: string;
}

export default function PositionChart({
  drivers,
  selectedDrivers,
  title = "Position Changes",
}: PositionChartProps) {
  const visibleDrivers = drivers.filter((d) =>
    selectedDrivers.includes(d.driverId),
  );

  if (visibleDrivers.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center py-20">
        <p className="text-text-muted">Select drivers to view positions</p>
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
        row[driver.driverId] = lapData.position;
      }
    }
    chartData.push(row);
  }

  const totalDrivers = Math.max(
    ...visibleDrivers.flatMap((d) => d.laps.map((l) => l.position)),
    20,
  );

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
            reversed
            domain={[1, Math.min(totalDrivers, 20)]}
            label={{
              value: "Position",
              angle: -90,
              position: "insideLeft",
              style: { fill: "var(--text-muted)", fontSize: 11 },
            }}
            width={52}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const sorted = [...payload].sort(
                (a, b) => (a.value as number) - (b.value as number),
              );
              return (
                <div className="rounded-lg border border-border-primary bg-bg-card p-3 shadow-lg">
                  <p className="mb-2 text-xs font-semibold text-text-secondary">
                    Lap {label}
                  </p>
                  {sorted.map((entry) => (
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
                      <span className="font-mono font-semibold text-text-primary">
                        P{entry.value}
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

          {visibleDrivers.map((driver) => (
            <Line
              key={driver.driverId}
              type="stepAfter"
              dataKey={driver.driverId}
              stroke={getTeamColor(driver.constructorId)}
              strokeWidth={2.5}
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
