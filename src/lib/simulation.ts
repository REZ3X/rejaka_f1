import { PIT_STOP_PENALTY_MS, TIRE_COMPOUNDS } from "./constants";
import type {
  ComparisonResult,
  SimulatedLap,
  SimulationResult,
  Stint,
  StrategyConfig,
  TireCompound,
} from "./types";
import { parseLapTime } from "./utils";

/**
 * Calculate tire degradation in milliseconds for a given compound and tire age.
 *
 * Model: degradation increases quadratically with tire age for realism.
 * Early laps have minimal deg, it ramps up sharply on old tires.
 */
function calculateDegradation(compound: TireCompound, lapAge: number): number {
  const rate = TIRE_COMPOUNDS[compound].degradationRate;
  // Quadratic model: slight initial deg, accelerating
  const degSeconds = rate * lapAge + 0.002 * lapAge * lapAge;
  return Math.round(degSeconds * 1000);
}

/**
 * Get the compound time offset in milliseconds.
 * Soft is faster, hard is slower relative to medium baseline.
 */
function getCompoundOffset(compound: TireCompound): number {
  return Math.round(TIRE_COMPOUNDS[compound].lapTimeOffset * 1000);
}

/**
 * Derive a base lap time from real lap data.
 * Uses median of non-outlier laps (excluding first lap and pit in/out laps).
 */
export function deriveBaseLapTime(
  realLapTimes: { lap: number; time: string }[],
  pitLaps: number[],
): number {
  const pitLapSet = new Set(pitLaps);
  const pitOutLaps = new Set(pitLaps.map((l) => l + 1));

  const cleanTimes = realLapTimes
    .filter((l) => {
      const lap = l.lap;
      // Exclude first lap (formation effects), pit-in laps, pit-out laps
      if (lap === 1) return false;
      if (pitLapSet.has(lap)) return false;
      if (pitOutLaps.has(lap)) return false;
      return true;
    })
    .map((l) => parseLapTime(l.time))
    .filter((t) => t > 0)
    .sort((a, b) => a - b);

  if (cleanTimes.length === 0) {
    // Fallback: use all laps
    const allTimes = realLapTimes
      .map((l) => parseLapTime(l.time))
      .filter((t) => t > 0)
      .sort((a, b) => a - b);
    return allTimes[Math.floor(allTimes.length * 0.25)] ?? 90000;
  }

  // Use 25th percentile (fast but realistic baseline)
  const idx = Math.floor(cleanTimes.length * 0.25);
  return cleanTimes[idx];
}

/**
 * Build stint definitions from pit stop configuration.
 */
function buildStints(config: StrategyConfig): Stint[] {
  const stints: Stint[] = [];

  // Sort stops by lap
  const sortedStops = [...config.stops].sort((a, b) => a.lap - b.lap);

  // First stint: start on the first compound specified
  // The first entry in stops defines: which lap to pit AND what compound to switch TO
  // So the starting compound needs to be inferred or specified.
  // Convention: the starting compound is the compound BEFORE the first stop.
  // require the first stop to define the starting compound via a special rule:
  // stops[0].compound = compound to switch TO after first pit stop
  // Starting compound = add an optional startCompound, defaulting to medium

  let currentLap = 1;
  const startCompound: TireCompound =
    sortedStops.length > 0
      ? guessStartCompound(sortedStops[0].compound)
      : "medium";

  for (let i = 0; i < sortedStops.length; i++) {
    const stop = sortedStops[i];
    stints.push({
      startLap: currentLap,
      endLap: stop.lap,
      compound: i === 0 ? startCompound : sortedStops[i - 1].compound,
    });
    currentLap = stop.lap + 1;
  }

  // Final stint
  stints.push({
    startLap: currentLap,
    endLap: config.totalLaps,
    compound: sortedStops.length > 0
      ? sortedStops[sortedStops.length - 1].compound
      : "medium",
  });

  return stints;
}

/**
 * Guess a reasonable starting compound based on the first switch-to compound.
 */
function guessStartCompound(firstSwitchTo: TireCompound): TireCompound {
  // Common F1 strategy: start soft/medium, switch to harder compound
  switch (firstSwitchTo) {
    case "hard":
      return "medium";
    case "medium":
      return "soft";
    case "soft":
      return "medium";
    default:
      return "medium";
  }
}

/**
 * Run a deterministic strategy simulation.
 */
export function simulateStrategy(
  config: StrategyConfig,
  baseLapTimeMs: number,
  realLapTimesMs: number[],
): SimulationResult {
  const stints = buildStints(config);
  const laps: SimulatedLap[] = [];
  let totalTime = 0;

  for (let lapNum = 1; lapNum <= config.totalLaps; lapNum++) {
    // Find which stint this lap belongs to
    const stint = stints.find(
      (s) => lapNum >= s.startLap && lapNum <= s.endLap,
    );
    if (!stint) continue;

    const lapAge = lapNum - stint.startLap; // 0-indexed age on current tires
    const isPitLap = config.stops.some((s) => s.lap === lapNum);

    const compoundOffset = getCompoundOffset(stint.compound);
    const degradation = calculateDegradation(stint.compound, lapAge);
    const pitPenalty = isPitLap ? PIT_STOP_PENALTY_MS : 0;

    // Simulated lap time = base + compound offset + degradation + pit penalty
    const lapTime = baseLapTimeMs + compoundOffset + degradation + pitPenalty;

    laps.push({
      lap: lapNum,
      time: lapTime,
      compound: stint.compound,
      lapAge,
      isPitLap,
      pitPenalty,
      degradation,
      baseTime: baseLapTimeMs,
    });

    totalTime += lapTime;
  }

  // Calculate real total time
  const realTotalTime = realLapTimesMs.reduce((sum, t) => sum + t, 0);

  return {
    totalTime,
    laps,
    stints,
    realTotalTime,
    timeDelta: totalTime - realTotalTime,
  };
}

/**
 * Compare two strategies against each other.
 */
export function compareStrategies(
  configA: StrategyConfig,
  configB: StrategyConfig,
  baseLapTimeMs: number,
  realLapTimesMs: number[],
): ComparisonResult {
  const strategyA = simulateStrategy(configA, baseLapTimeMs, realLapTimesMs);
  const strategyB = simulateStrategy(configB, baseLapTimeMs, realLapTimesMs);

  // Calculate cumulative gap at each lap
  const maxLaps = Math.max(strategyA.laps.length, strategyB.laps.length);
  const gapByLap: number[] = [];
  let cumulativeA = 0;
  let cumulativeB = 0;

  for (let i = 0; i < maxLaps; i++) {
    cumulativeA += strategyA.laps[i]?.time ?? 0;
    cumulativeB += strategyB.laps[i]?.time ?? 0;
    gapByLap.push(cumulativeA - cumulativeB);
  }

  const timeDifference = strategyA.totalTime - strategyB.totalTime;

  return {
    strategyA,
    strategyB,
    gapByLap,
    winner: timeDifference > 0 ? "B" : "A",
    timeDifference: Math.abs(timeDifference),
  };
}
