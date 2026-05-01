"use client";

import Badge from "@/components/ui/Badge";
import Slider from "@/components/ui/Slider";
import Select from "@/components/ui/Select";
import type { TireCompound } from "@/lib/types";
import { Minus, Plus } from "lucide-react";

interface StopConfig {
  lap: number;
  compound: TireCompound;
}

interface StrategyConfiguratorProps {
  stops: StopConfig[];
  totalLaps: number;
  onStopsChange: (stops: StopConfig[]) => void;
}

const COMPOUND_OPTIONS = [
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function StrategyConfigurator({
  stops,
  totalLaps,
  onStopsChange,
}: StrategyConfiguratorProps) {
  const addStop = () => {
    if (stops.length >= 3) return;
    const lastLap = stops.length > 0 ? stops[stops.length - 1].lap : 0;
    const newLap = Math.min(lastLap + Math.floor(totalLaps / 3), totalLaps - 2);
    onStopsChange([...stops, { lap: newLap, compound: "hard" }]);
  };

  const removeStop = (index: number) => {
    onStopsChange(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, updates: Partial<StopConfig>) => {
    const newStops = stops.map((s, i) =>
      i === index ? { ...s, ...updates } : s,
    );
    onStopsChange(newStops);
  };

  // Build stint visualization
  const stintSegments: { start: number; end: number; compound: TireCompound }[] = [];
  const sortedStops = [...stops].sort((a, b) => a.lap - b.lap);

  let cursor = 1;
  const startCompound: TireCompound =
    sortedStops.length > 0
      ? sortedStops[0].compound === "hard"
        ? "medium"
        : sortedStops[0].compound === "medium"
          ? "soft"
          : "medium"
      : "medium";

  for (let i = 0; i < sortedStops.length; i++) {
    stintSegments.push({
      start: cursor,
      end: sortedStops[i].lap,
      compound: i === 0 ? startCompound : sortedStops[i - 1].compound,
    });
    cursor = sortedStops[i].lap + 1;
  }
  stintSegments.push({
    start: cursor,
    end: totalLaps,
    compound: sortedStops.length > 0
      ? sortedStops[sortedStops.length - 1].compound
      : "medium",
  });

  return (
    <div className="space-y-5">
      {/* Stint timeline visualization */}
      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Strategy Timeline
        </label>
        <div className="flex h-8 w-full overflow-hidden rounded-lg border border-border-subtle">
          {stintSegments.map((seg) => {
            const width =
              ((seg.end - seg.start + 1) / totalLaps) * 100;
            const compoundColor =
              seg.compound === "soft"
                ? "var(--color-tire-soft)"
                : seg.compound === "medium"
                  ? "var(--color-tire-medium)"
                  : seg.compound === "hard"
                    ? "#cccccc"
                    : "var(--color-tire-inter)";

            return (
              <div
                key={`${seg.start}-${seg.end}`}
                className="flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  width: `${width}%`,
                  backgroundColor: `${compoundColor}25`,
                  borderRight: "1px solid var(--border-subtle)",
                  color: compoundColor,
                  minWidth: "30px",
                }}
              >
                {width > 8 && (
                  <span>L{seg.start}–{seg.end}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>Lap 1</span>
          <span>Lap {totalLaps}</span>
        </div>
      </div>

      {/* Starting compound display */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span>Starting on:</span>
        <Badge compound={startCompound} size="sm" />
      </div>

      {/* Pit stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">
            Pit Stops ({stops.length})
          </label>
          <button
            type="button"
            onClick={addStop}
            disabled={stops.length >= 3}
            className="inline-flex items-center gap-1 rounded-lg bg-f1-red/10 px-3 py-1.5 text-xs font-semibold text-f1-red transition-colors hover:bg-f1-red/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-3 w-3" />
            Add Stop
          </button>
        </div>

        {stops.length === 0 && (
          <p className="rounded-lg border border-border-subtle bg-bg-card p-4 text-center text-sm text-text-muted">
            No pit stops configured. Add a stop to start simulating.
          </p>
        )}

        {stops.map((stop, index) => (
          <div
            key={`stop-${index}`}
            className="rounded-lg border border-border-subtle bg-bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">
                Stop {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeStop(index)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Minus className="h-3 w-3" />
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <Slider
                id={`pit-lap-${index}`}
                label="Pit on Lap"
                value={stop.lap}
                min={2}
                max={totalLaps - 1}
                onChange={(lap) => updateStop(index, { lap })}
                formatValue={(v) => `Lap ${v}`}
              />

              <Select
                id={`compound-${index}`}
                label="Switch to"
                options={COMPOUND_OPTIONS}
                value={stop.compound}
                onChange={(v) =>
                  updateStop(index, { compound: v as TireCompound })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
