import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

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

    if (userId === 999) {
      const userRes = await dbQuery("SELECT id FROM accounts WHERE username = 'user1' LIMIT 1");
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    const result = await dbQuery(
      `SELECT
        id::text,
        duration,
        wpm,
        filler_word_count,
        created_at
       FROM "FluencySync".sessions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ ok: true, sessions: result.rows });
  } catch (error) {
    console.error("Failed to fetch FluencySync data:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
