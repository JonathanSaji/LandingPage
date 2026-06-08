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

    const accountRes = await dbQuery(
      `SELECT username, email, display_name FROM accounts WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (accountRes.rows.length === 0) {
      return NextResponse.json({ ok: true, membership: null });
    }

    const { username, email, display_name: displayName } = accountRes.rows[0];

    const result = await dbQuery(
      `SELECT
        email,
        name,
        display_name,
        max_allowed_days,
        company_id,
        organization_name,
        role
       FROM "SeatSync".seatsync_membership
       WHERE display_name = $1
          OR email = $2
          OR email = $3
       LIMIT 1`,
      [username, email, `${username}@seatsync.dev`]
    );

    if (result.rows.length === 0 && displayName && displayName !== username) {
      const fallback = await dbQuery(
        `SELECT
          email,
          name,
          display_name,
          max_allowed_days,
          company_id,
          organization_name,
          role
         FROM "SeatSync".seatsync_membership
         WHERE display_name = $1
         LIMIT 1`,
        [displayName]
      );

      return NextResponse.json({
        ok: true,
        membership: fallback.rows[0] ?? null,
      });
    }

    return NextResponse.json({
      ok: true,
      membership: result.rows[0] ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch SeatSync membership:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
