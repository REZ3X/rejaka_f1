// ============================================================
// Jolpica F1 API Response Types
// ============================================================

/** Root wrapper for all Jolpica API responses */
export interface MRData<T extends string, D> {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  [key: string]: unknown;
}

// --- Location & Circuit ---
export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

// --- Driver & Constructor ---
export interface Driver {
  driverId: string;
  permanentNumber?: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

// --- Race ---
export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

// --- Race Results ---
export interface FastestLap {
  rank: string;
  lap: string;
  Time: { time: string };
  AverageSpeed?: { units: string; speed: string };
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: FastestLap;
}

export interface RaceWithResults extends Race {
  Results: RaceResult[];
}

// --- Laps ---
export interface LapTiming {
  driverId: string;
  time: string;
  position: string;
}

export interface Lap {
  number: string;
  Timings: LapTiming[];
}

export interface RaceWithLaps extends Race {
  Laps: Lap[];
}

// --- Pit Stops ---
export interface PitStop {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
}

export interface RaceWithPitStops extends Race {
  PitStops: PitStop[];
}

// ============================================================
// Jolpica API Response Wrappers
// ============================================================

export interface RacesResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      Races: Race[];
    };
  };
}

export interface ResultsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      round: string;
      Races: RaceWithResults[];
    };
  };
}

export interface LapsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      round: string;
      Races: RaceWithLaps[];
    };
  };
}

export interface PitStopsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      round: string;
      Races: RaceWithPitStops[];
    };
  };
}

// ============================================================
// Simulation Types
// ============================================================

export type TireCompound = "soft" | "medium" | "hard" | "intermediate" | "wet";

export interface Stint {
  startLap: number;
  endLap: number;
  compound: TireCompound;
}

export interface StrategyConfig {
  season: string;
  round: string;
  driverId: string;
  totalLaps: number;
  stops: { lap: number; compound: TireCompound }[];
}

export interface SimulatedLap {
  lap: number;
  time: number; // milliseconds
  compound: TireCompound;
  lapAge: number; // laps on current tire
  isPitLap: boolean;
  pitPenalty: number;
  degradation: number;
  baseTime: number;
}

export interface SimulationResult {
  totalTime: number;
  laps: SimulatedLap[];
  stints: Stint[];
  realTotalTime: number;
  timeDelta: number; // positive = slower than real, negative = faster
}

export interface ComparisonResult {
  strategyA: SimulationResult;
  strategyB: SimulationResult;
  gapByLap: number[]; // cumulative gap A-B per lap
  winner: "A" | "B";
  timeDifference: number;
}

// ============================================================
// Normalized App Types
// ============================================================

/** Flattened driver lap data for charting */
export interface DriverLapData {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  constructorId: string;
  laps: {
    lap: number;
    time: number; // milliseconds
    position: number;
  }[];
}
