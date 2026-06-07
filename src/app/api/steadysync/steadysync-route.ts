import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

function getAccountId(req: NextRequest): number | null {
  const userIdStr = req.nextUrl?.searchParams?.get("userId");
  if (userIdStr) {
    const id = parseInt(userIdStr, 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    let userId = getAccountId(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId query parameter is required." },
        { status: 400 }
      );
    }

    // Resolve bypass ID
    if (userId === 999) {
      const userRes = await dbQuery(
        "SELECT id FROM accounts WHERE username = 'user1' LIMIT 1"
      );
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    // Try to get existing settings row
    const result = await dbQuery(
      `SELECT settings_id, user_id, steady_mouse, hitbox_enabled, snap_enabled, voice_enabled, updated_at
       FROM "SteadySync".user_settings
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return defaults if no row yet
      return NextResponse.json({
        ok: true,
        settings: {
          steady_mouse: false,
          hitbox_enabled: false,
          snap_enabled: false,
          voice_enabled: false,
          updated_at: null,
        },
        exists: false,
      });
    }

    return NextResponse.json({ ok: true, settings: result.rows[0], exists: true });
  } catch (error) {
    console.error("Failed to fetch SteadySync settings:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    let userId = getAccountId(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId query parameter is required." },
        { status: 400 }
      );
    }

    if (userId === 999) {
      const userRes = await dbQuery(
        "SELECT id FROM accounts WHERE username = 'user1' LIMIT 1"
      );
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    const body = await req.json();
    const { steady_mouse, hitbox_enabled, snap_enabled, voice_enabled } = body;

    // Upsert the settings row
    const result = await dbQuery(
      `INSERT INTO "SteadySync".user_settings (user_id, steady_mouse, hitbox_enabled, snap_enabled, voice_enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         steady_mouse   = EXCLUDED.steady_mouse,
         hitbox_enabled = EXCLUDED.hitbox_enabled,
         snap_enabled   = EXCLUDED.snap_enabled,
         voice_enabled  = EXCLUDED.voice_enabled,
         updated_at     = now()
       RETURNING steady_mouse, hitbox_enabled, snap_enabled, voice_enabled, updated_at`,
      [userId, steady_mouse, hitbox_enabled, snap_enabled, voice_enabled]
    );

    return NextResponse.json({ ok: true, settings: result.rows[0] });
  } catch (error) {
    console.error("Failed to update SteadySync settings:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}