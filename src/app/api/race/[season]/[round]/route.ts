import { fetchRaceResults } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/race/[season]/[round]">,
) {
  const { season, round } = await ctx.params;

  try {
    const data = await fetchRaceResults(season, round);
    return Response.json(data);
  } catch (error) {
    console.error("Failed to fetch race results:", error);
    return Response.json(
      { error: "Failed to fetch race results" },
      { status: 500 },
    );
  }
}
