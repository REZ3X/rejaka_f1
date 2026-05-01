"use client";

import StrategyConfigurator from "./StrategyConfigurator";
import type { TireCompound } from "@/lib/types";
import { formatGap, formatLapTime } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { SimulationResult } from "@/lib/types";

interface StopConfig {
  lap: number;
  compound: TireCompound;
}

interface StrategyPanelProps {
  label: string;
  color: string;
  stops: StopConfig[];
  totalLaps: number;
  onStopsChange: (stops: StopConfig[]) => void;
  simulation: SimulationResult | null;
}

export default function StrategyPanel({
  label,
  color,
  stops,
  totalLaps,
  onStopsChange,
  simulation,
}: StrategyPanelProps) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle"
        style={{ backgroundColor: `${color}08` }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-black text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
        <span className="text-sm font-semibold text-text-primary">
          Strategy {label}
        </span>
        {simulation && (
          <span className="ml-auto font-mono text-sm font-semibold text-text-primary">
            {formatLapTime(simulation.totalTime)}
          </span>
        )}
      </div>

      {/* Configuration */}
      <div className="p-5">
        <StrategyConfigurator
          stops={stops}
          totalLaps={totalLaps}
          onStopsChange={onStopsChange}
        />
      </div>

      {/* Summary */}
      {simulation && (
        <div className="border-t border-border-subtle px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Simulated</span>
            <span className="font-mono font-semibold text-text-primary">
              {formatLapTime(simulation.totalTime)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">vs Real</span>
            <span
              className={`flex items-center gap-1 font-mono font-semibold ${
                simulation.timeDelta <= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {simulation.timeDelta <= 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {formatGap(simulation.timeDelta)}
            </span>
          </div>
          <div className="pt-1 space-y-1">
            {simulation.stints.map((stint, i) => (
              <div
                key={`stint-${stint.startLap}`}
                className="flex justify-between text-xs text-text-muted"
              >
                <span>
                  Stint {i + 1}: L{stint.startLap}–{stint.endLap}
                </span>
                <span
                  className="font-semibold"
                  style={{
                    color:
                      stint.compound === "soft"
                        ? "#ff3333"
                        : stint.compound === "medium"
                          ? "#ffc700"
                          : "#cccccc",
                  }}
                >
                  {stint.compound.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
