import type { TireCompound } from "./types";

// ============================================================
// API Configuration
// ============================================================
export const API_BASE_URL = "https://api.jolpi.ca/ergast/f1";
export const API_PAGE_LIMIT = 100; // Jolpica caps at 100
export const API_REQUEST_DELAY_MS = 333; // Stay under 4 req/s burst limit (3 r/s to be safe)

// ============================================================
// Cache Configuration
// ============================================================
export const CACHE_TTL_HISTORICAL = 60 * 60 * 1000; // 1 hour for past seasons
export const CACHE_TTL_CURRENT = 5 * 60 * 1000; // 5 minutes for current season
export const CURRENT_SEASON = String(new Date().getFullYear() - 1);

// ============================================================
// Tire Compounds
// ============================================================
export const TIRE_COMPOUNDS: Record<
  TireCompound,
  {
    label: string;
    color: string;
    bgColor: string;
    degradationRate: number; // seconds per lap of tire age
    lapTimeOffset: number; // seconds faster/slower than baseline
  }
> = {
  soft: {
    label: "Soft",
    color: "#FF3333",
    bgColor: "rgba(255, 51, 51, 0.15)",
    degradationRate: 0.065,
    lapTimeOffset: -0.6, // 0.6s faster than medium baseline
  },
  medium: {
    label: "Medium",
    color: "#FFC700",
    bgColor: "rgba(255, 199, 0, 0.15)",
    degradationRate: 0.04,
    lapTimeOffset: 0, // baseline
  },
  hard: {
    label: "Hard",
    color: "#FFFFFF",
    bgColor: "rgba(255, 255, 255, 0.1)",
    degradationRate: 0.025,
    lapTimeOffset: 0.4, // 0.4s slower than medium baseline
  },
  intermediate: {
    label: "Inter",
    color: "#43B02A",
    bgColor: "rgba(67, 176, 42, 0.15)",
    degradationRate: 0.05,
    lapTimeOffset: 3.0,
  },
  wet: {
    label: "Wet",
    color: "#0072CE",
    bgColor: "rgba(0, 114, 206, 0.15)",
    degradationRate: 0.035,
    lapTimeOffset: 6.0,
  },
};

export const PIT_STOP_PENALTY_MS = 22000; // ~22 seconds in milliseconds

// ============================================================
// F1 Team Colors (2024 Season)
// ============================================================
export const TEAM_COLORS: Record<string, string> = {
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#FF87BC",
  williams: "#64C4FF",
  rb: "#6692FF",
  sauber: "#52E252",
  haas: "#B6BABD",
  // Fallback
  default: "#888888",
};

// ============================================================
// Season Range
// ============================================================
export const MIN_SEASON = 2000;
export const MAX_SEASON = new Date().getFullYear();

export const SEASONS = Array.from(
  { length: MAX_SEASON - MIN_SEASON + 1 },
  (_, i) => MAX_SEASON - i,
);

// ============================================================
// Chart Colors for multi-driver views
// ============================================================
export const CHART_COLORS = [
  "#e10600", // F1 Red
  "#3671C6", // Blue
  "#FF8000", // Orange
  "#27F4D2", // Teal
  "#FF87BC", // Pink
  "#229971", // Green
  "#64C4FF", // Light Blue
  "#FFC700", // Yellow
  "#B6BABD", // Silver
  "#52E252", // Lime
];
