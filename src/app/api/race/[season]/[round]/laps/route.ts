import { fetchAllLaps } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/race/[season]/[round]/laps">,
) {
  const { season, round } = await ctx.params;

  try {
    const laps = await fetchAllLaps(season, round);
    return Response.json({ laps, season, round });
  } catch (error) {
    console.error("Failed to fetch laps:", error);
    return Response.json(
      { error: "Failed to fetch lap data" },
      { status: 500 },
    );
  }
}
