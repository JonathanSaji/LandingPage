import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

type PlanDetails = {
  name?: string;
  dates?: string;
  group?: string;
  budget?: string;
  location?: string;
  people?: number | string;
  travelers?: number | string;
  partySize?: number | string;
  headcount?: number | string;
};

type ItineraryRoot = {
  tripName?: string;
};

function parsePeopleCount(plan: PlanDetails | null): number | null {
  if (!plan) return null;
  const raw =
    plan.people ??
    plan.travelers ??
    plan.partySize ??
    plan.headcount;
  if (raw === undefined || raw === null || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");

    if (!userIdStr) {
      return NextResponse.json(
        { ok: false, error: "userId query parameter is required." },
        { status: 400 },
      );
    }

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId parameter." },
        { status: 400 },
      );
    }

    const result = await dbQuery<{
      id: string;
      plan_details: PlanDetails | null;
      itinerary: ItineraryRoot | null;
      updated_at: string;
      share_count: string;
    }>(
      `SELECT
        t.id,
        t.plan_details,
        t.itinerary,
        t.updated_at,
        COALESCE(s.share_count, 0)::text AS share_count
       FROM "TravelSync".trips t
       LEFT JOIN (
         SELECT trip_id, COUNT(*) AS share_count
         FROM "TravelSync".trip_shares
         GROUP BY trip_id
       ) s ON s.trip_id = t.id
       WHERE t.owner_id = $1
       ORDER BY t.updated_at DESC`,
      [userId],
    );

    const trips = result.rows.map((row) => {
      const plan = row.plan_details ?? {};
      const itinerary = row.itinerary ?? {};
      const shares = parseInt(row.share_count, 10) || 0;
      const peopleFromPlan = parsePeopleCount(plan);
      const peopleCount = peopleFromPlan ?? shares + 1;

      return {
        id: row.id,
        name: plan.name || itinerary.tripName || "Untitled trip",
        location: plan.location?.trim() || null,
        dates: plan.dates?.trim() || null,
        group: plan.group?.trim() || null,
        peopleCount,
        budget: plan.budget?.trim() || null,
        updatedAt: row.updated_at,
      };
    });

    return NextResponse.json({ ok: true, trips });
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
