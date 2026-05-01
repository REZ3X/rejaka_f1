import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { season, round, driverId, stops } = body;

    if (!season || !round || !driverId || !stops) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const strategy = await prisma.strategy.create({
      data: {
        season,
        round,
        driverId,
        stops,
      },
    });

    return NextResponse.json({ id: strategy.id });
  } catch (error) {
    console.error("Error saving strategy:", error);
    return NextResponse.json(
      { error: "Failed to save strategy" },
      { status: 500 }
    );
  }
}
