import { fetchRaces } from "@/lib/api";
import { CURRENT_SEASON } from "@/lib/constants";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") || CURRENT_SEASON;

  try {
    const races = await fetchRaces(season);
    return Response.json({ races, season });
  } catch (error) {
    console.error("Failed to fetch races:", error);
    return Response.json(
      { error: "Failed to fetch race data" },
      { status: 500 },
    );
  }
}
