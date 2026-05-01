import {
  API_BASE_URL,
  API_PAGE_LIMIT,
  API_REQUEST_DELAY_MS,
  CACHE_TTL_CURRENT,
  CACHE_TTL_HISTORICAL,
  CURRENT_SEASON,
} from "./constants";
import type {
  Lap,
  LapsResponse,
  PitStop,
  PitStopsResponse,
  Race,
  RaceResult,
  RacesResponse,
  ResultsResponse,
} from "./types";
import { sleep } from "./utils";

// ============================================================
// In-memory cache for server-side API responses
// ============================================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, season: string): void {
  const ttl =
    season === CURRENT_SEASON ? CACHE_TTL_CURRENT : CACHE_TTL_HISTORICAL;
  cache.set(key, { data, expiry: Date.now() + ttl });
}

// ============================================================
// Fetch with rate-limit delay
// ============================================================

let lastRequestTime = 0;

async function rateLimitedFetch(url: string, retries = 3): Promise<Response> {
  const now = Date.now();
  let delay = 0;

  if (lastRequestTime < now) {
    lastRequestTime = now;
  } else {
    // Schedule this request after the previously scheduled one
    lastRequestTime += API_REQUEST_DELAY_MS;
    delay = lastRequestTime - now;
  }

  if (delay > 0) {
    await sleep(delay);
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch (error) {
    if (retries > 0) {
      await sleep(1000);
      return rateLimitedFetch(url, retries - 1);
    }
    throw error;
  }

  if (!res.ok) {
    if (res.status === 429 && retries > 0) {
      const retryAfter = res.headers.get("retry-after");
      const backoff = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
      await sleep(backoff);
      return rateLimitedFetch(url, retries - 1);
    }
    if (res.status >= 500 && retries > 0) {
      await sleep(1000);
      return rateLimitedFetch(url, retries - 1);
    }
    throw new Error(`Jolpica API error: ${res.status} ${res.statusText}`);
  }
  return res;
}

// ============================================================
// Seasons
// ============================================================

export async function fetchSeasons(): Promise<string[]> {
  const cacheKey = "seasons";
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  const res = await rateLimitedFetch(
    `${API_BASE_URL}/seasons.json?limit=${API_PAGE_LIMIT}`,
  );
  const data = await res.json();
  const seasons: string[] = data.MRData.SeasonTable.Seasons.map(
    (s: { season: string }) => s.season,
  ).reverse();

  setCache(cacheKey, seasons, "historical");
  return seasons;
}

// ============================================================
// Races
// ============================================================

export async function fetchRaces(season: string): Promise<Race[]> {
  const cacheKey = `races-${season}`;
  const cached = getCached<Race[]>(cacheKey);
  if (cached) return cached;

  const res = await rateLimitedFetch(
    `${API_BASE_URL}/${season}.json?limit=${API_PAGE_LIMIT}`,
  );
  const data: RacesResponse = await res.json();
  const races = data.MRData.RaceTable.Races;

  setCache(cacheKey, races, season);
  return races;
}

// ============================================================
// Race Results
// ============================================================

export async function fetchRaceResults(
  season: string,
  round: string,
): Promise<{ race: Race; results: RaceResult[] }> {
  const cacheKey = `results-${season}-${round}`;
  const cached = getCached<{ race: Race; results: RaceResult[] }>(cacheKey);
  if (cached) return cached;

  const res = await rateLimitedFetch(
    `${API_BASE_URL}/${season}/${round}/results.json?limit=${API_PAGE_LIMIT}`,
  );
  const data: ResultsResponse = await res.json();
  const raceData = data.MRData.RaceTable.Races[0];

  if (!raceData) {
    throw new Error(`No results found for ${season} round ${round}`);
  }

  const result = {
    race: {
      season: raceData.season,
      round: raceData.round,
      url: raceData.url,
      raceName: raceData.raceName,
      Circuit: raceData.Circuit,
      date: raceData.date,
      time: raceData.time,
    },
    results: raceData.Results,
  };

  setCache(cacheKey, result, season);
  return result;
}

// ============================================================
// Laps (auto-paginate all laps)
// ============================================================

export async function fetchAllLaps(
  season: string,
  round: string,
): Promise<Lap[]> {
  const cacheKey = `laps-${season}-${round}`;
  const cached = getCached<Lap[]>(cacheKey);
  if (cached) return cached;

  const allLaps: Lap[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const res = await rateLimitedFetch(
      `${API_BASE_URL}/${season}/${round}/laps.json?limit=${API_PAGE_LIMIT}&offset=${offset}`,
    );
    const data: LapsResponse = await res.json();
    total = Number.parseInt(data.MRData.total, 10);

    const raceLaps = data.MRData.RaceTable.Races[0]?.Laps ?? [];
    allLaps.push(...raceLaps);

    const returnedLimit = Number.parseInt(data.MRData.limit, 10);
    offset += Number.isNaN(returnedLimit) ? API_PAGE_LIMIT : returnedLimit;

    if (raceLaps.length === 0) {
      break;
    }
  }

  setCache(cacheKey, allLaps, season);
  return allLaps;
}

// ============================================================
// Pit Stops
// ============================================================

export async function fetchPitStops(
  season: string,
  round: string,
): Promise<PitStop[]> {
  const cacheKey = `pitstops-${season}-${round}`;
  const cached = getCached<PitStop[]>(cacheKey);
  if (cached) return cached;

  const allPitStops: PitStop[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const res = await rateLimitedFetch(
      `${API_BASE_URL}/${season}/${round}/pitstops.json?limit=${API_PAGE_LIMIT}&offset=${offset}`,
    );
    const data: PitStopsResponse = await res.json();
    total = Number.parseInt(data.MRData.total, 10);

    const racePitStops = data.MRData.RaceTable.Races[0]?.PitStops ?? [];
    allPitStops.push(...racePitStops);

    const returnedLimit = Number.parseInt(data.MRData.limit, 10);
    offset += Number.isNaN(returnedLimit) ? API_PAGE_LIMIT : returnedLimit;

    if (racePitStops.length === 0) {
      break;
    }
  }

  setCache(cacheKey, allPitStops, season);
  return allPitStops;
}
