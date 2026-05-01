import { fetchPitStops, fetchRaceResults } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/race/[season]/[round]/drivers">,
) {
  const { season, round } = await ctx.params;

  try {
    const [resultData, pitStops] = await Promise.all([
      fetchRaceResults(season, round),
      fetchPitStops(season, round),
    ]);

    const drivers = resultData.results.map((r) => ({
      driverId: r.Driver.driverId,
      code: r.Driver.code,
      givenName: r.Driver.givenName,
      familyName: r.Driver.familyName,
      number: r.number,
      constructorId: r.Constructor.constructorId,
      constructorName: r.Constructor.name,
      position: r.position,
      totalLaps: r.laps,
      status: r.status,
    }));

    return Response.json({ drivers, pitStops, season, round });
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    return Response.json(
      { error: "Failed to fetch driver data" },
      { status: 500 },
    );
  }
}
