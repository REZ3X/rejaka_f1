import { TEAM_COLORS } from "./constants";

/**
 * Parse a lap time string like "1:32.608" or "32.608" into milliseconds.
 */
export function parseLapTime(timeStr: string): number {
  if (!timeStr) return 0;

  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const minutes = Number.parseInt(parts[0], 10);
    const seconds = Number.parseFloat(parts[1]);
    return Math.round((minutes * 60 + seconds) * 1000);
  }
  // Seconds only
  return Math.round(Number.parseFloat(parts[0]) * 1000);
}

/**
 * Format milliseconds as a lap time string "1:32.608"
 */
export function formatLapTime(ms: number): string {
  if (ms <= 0) return "-";
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
  }
  return seconds.toFixed(3);
}

/**
 * Format milliseconds as a gap string "+1.234s" or "-1.234s"
 */
export function formatGap(ms: number): string {
  if (ms === 0) return "0.000s";
  const sign = ms > 0 ? "+" : "-";
  const absMs = Math.abs(ms);
  const seconds = absMs / 1000;

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${sign}${minutes}:${remainingSeconds.toFixed(3).padStart(6, "0")}`;
  }
  return `${sign}${seconds.toFixed(3)}s`;
}

/**
 * Get the team color for a constructor ID.
 */
export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId] ?? TEAM_COLORS.default;
}

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get country flag emoji from country name.
 */
const COUNTRY_FLAGS: Record<string, string> = {
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  Australia: "🇦🇺",
  Japan: "🇯🇵",
  China: "🇨🇳",
  USA: "🇺🇸",
  Italy: "🇮🇹",
  Monaco: "🇲🇨",
  Canada: "🇨🇦",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  Hungary: "🇭🇺",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Portugal: "🇵🇹",
  Turkey: "🇹🇷",
  Russia: "🇷🇺",
  "South Korea": "🇰🇷",
  India: "🇮🇳",
  Malaysia: "🇲🇾",
  Bahamas: "🇧🇸",
  Switzerland: "🇨🇭",
  Sweden: "🇸🇪",
};

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🏁";
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Delay for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
