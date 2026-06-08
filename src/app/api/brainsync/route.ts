import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

type BrainAnalytics = Record<string, unknown> & {
  focusScore?: unknown;
  focusEfficiency?: unknown;
};

function numberFromAnalyticsValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeAnalytics(analytics: unknown) {
  if (!analytics || typeof analytics !== "object" || Array.isArray(analytics)) {
    return analytics;
  }

  const data = analytics as BrainAnalytics;
  const focusScore =
    numberFromAnalyticsValue(data.focusScore) ??
    numberFromAnalyticsValue(data.focusEfficiency);

  if (focusScore === null) {
    return data;
  }

  return {
    ...data,
    focusScore,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");

    if (!userIdStr) {
      return NextResponse.json(
        { ok: false, error: "userId query parameter is required." },
        { status: 400 }
      );
    }

    let userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId parameter." },
        { status: 400 }
      );
    }

    // Resolve user1 bypass ID 999 to actual database ID of user1
    if (userId === 999) {
      const userRes = await dbQuery("SELECT id FROM accounts WHERE username = 'user1' LIMIT 1");
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    // Query insights from the BrainSync schema
    const insightsResult = await dbQuery(
      `SELECT 
        insight_id as id, 
        title, 
        intent, 
        duration, 
        start_time, 
        end_time, 
        completed_at, 
        analytics
       FROM "BrainSync".insights
       WHERE user_id = $1
       ORDER BY completed_at DESC`,
      [userId]
    );

    // Query presets from the BrainSync schema
    const presetsResult = await dbQuery(
      `SELECT 
        preset_id as id, 
        title, 
        intent, 
        duration, 
        stats, 
        created_at
       FROM "BrainSync".presets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const insights = insightsResult.rows.map((insight) => ({
      ...insight,
      analytics: normalizeAnalytics(insight.analytics),
    }));

    return NextResponse.json({
      ok: true,
      insights,
      presets: presetsResult.rows
    });
  } catch (error) {
    console.error("Failed to fetch BrainSync data:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
