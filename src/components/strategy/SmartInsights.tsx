"use client";

import { useMemo } from "react";
import type { SimulationResult, StrategyConfig } from "@/lib/types";
import { simulateStrategy } from "@/lib/simulation";
import { formatGap } from "@/lib/utils";
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface SmartInsightsProps {
  config: StrategyConfig;
  baseLapTimeMs: number;
  realLapTimesMs: number[];
  simulation: SimulationResult | null;
}

export default function SmartInsights({
  config,
  baseLapTimeMs,
  realLapTimesMs,
  simulation,
}: SmartInsightsProps) {
  const insights = useMemo(() => {
    if (!simulation || config.stops.length === 0) return [];

    const messages: { type: "positive" | "negative" | "warning"; text: string; icon: React.ElementType }[] = [];

    // Analyze each pit stop
    config.stops.forEach((stop, index) => {
      // Try 1 lap earlier
      const earlyStops = [...config.stops];
      earlyStops[index] = { ...earlyStops[index], lap: Math.max(1, earlyStops[index].lap - 1) };
      const earlyConfig = { ...config, stops: earlyStops };
      const earlySim = simulateStrategy(earlyConfig, baseLapTimeMs, realLapTimesMs);

      // Try 1 lap later
      const laterStops = [...config.stops];
      laterStops[index] = { ...laterStops[index], lap: Math.min(config.totalLaps - 1, laterStops[index].lap + 1) };
      const laterConfig = { ...config, stops: laterStops };
      const laterSim = simulateStrategy(laterConfig, baseLapTimeMs, realLapTimesMs);

      const earlyGain = simulation.totalTime - earlySim.totalTime;
      const laterGain = simulation.totalTime - laterSim.totalTime;

      if (earlyGain > 200) {
        messages.push({
          type: "positive",
          text: `Undercut opportunity: Pitting 1 lap earlier for Stop ${index + 1} could save ${formatGap(earlyGain).replace('+', '')}.`,
          icon: TrendingDown,
        });
      }

      if (laterGain > 200) {
        messages.push({
          type: "positive",
          text: `Overcut opportunity: Extending Stint ${index + 1} by 1 lap could save ${formatGap(laterGain).replace('+', '')}.`,
          icon: TrendingDown,
        });
      }
    });

    // Check if total time is worse than real
    if (simulation.timeDelta > 5000) {
      messages.push({
        type: "negative",
        text: `This strategy is significantly slower than the real race time by ${formatGap(simulation.timeDelta).replace('+', '')}.`,
        icon: TrendingUp,
      });
    }

    // Check for excessive degradation (softs for too long)
    simulation.laps.forEach(lap => {
        if(lap.compound === 'soft' && lap.lapAge > 20 && messages.filter(m => m.text.includes("High degradation risk")).length === 0) {
            messages.push({
                type: "warning",
                text: "High degradation risk: Running Soft tires for more than 20 laps is not recommended.",
                icon: AlertTriangle,
            });
        }
    });

    return messages;
  }, [config, baseLapTimeMs, realLapTimesMs, simulation]);

  if (!simulation || insights.length === 0) return null;

  return (
    <div className="glass-card p-5 border-l-4 border-l-orange-500">
      <div className="flex items-center gap-2 mb-3 text-orange-500 font-semibold text-sm uppercase tracking-wider">
        <Lightbulb className="h-4 w-4" />
        Engineer Insights
      </div>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={`insight-${idx}`} className="flex items-start gap-2 text-sm text-text-secondary">
            <div className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${
                insight.type === "positive" ? "bg-emerald-500/10 text-emerald-500" :
                insight.type === "negative" ? "bg-red-500/10 text-red-500" :
                "bg-yellow-500/10 text-yellow-500"
            }`}>
                <insight.icon className="h-3 w-3" />
            </div>
            <span>{insight.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
