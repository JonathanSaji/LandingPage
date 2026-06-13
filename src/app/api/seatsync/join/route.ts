import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, code } = body as {
      userId?: number;
      code?: string;
    };

    // ── Validation ─────────────────────────────────────────────
    if (!userId || !code) {
      return NextResponse.json(
        { ok: false, error: "userId and code are required." },
        { status: 400 }
      );
    }

    const id = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (isNaN(id)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId." },
        { status: 400 }
      );
    }

    // ── Fetch the landing-page account ─────────────────────────
    const accountRes = await dbQuery(
      `SELECT id, username, email, display_name, email_verified
       FROM accounts
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (accountRes.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Account not found." },
        { status: 404 }
      );
    }

    const account = accountRes.rows[0];

    if (!account.email_verified) {
      return NextResponse.json(
        { ok: false, error: "Please verify your email before joining a company." },
        { status: 403 }
      );
    }

    // ── Check user doesn't already have a membership ───────────
    const existingMembership = await dbQuery(
      `SELECT id FROM seatsync.seatsync_membership WHERE account_id = $1 LIMIT 1`,
      [id]
    );

    if (existingMembership.rows.length > 0) {
      return NextResponse.json(
        { ok: false, error: "You already belong to a SeatSync company." },
        { status: 409 }
      );
    }

    // ── Look up the invite code ────────────────────────────────
    const codeRes = await dbQuery(
      `SELECT ic.id, ic.company_id, ic.role, ic.used_by, ic.used_at, ic.expires_at,
              c.company_display_name AS organization_name
       FROM seatsync.invite_codes ic
       JOIN seatsync.companies c ON c.id = ic.company_id
       WHERE ic.code = $1
       LIMIT 1`,
      [code.trim().toUpperCase()]
    );

    if (codeRes.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid invite code." },
        { status: 404 }
      );
    }

    const invite = codeRes.rows[0];

    // ── Check if already used ──────────────────────────────────
    if (invite.used_by !== null) {
      return NextResponse.json(
        { ok: false, error: "This invite code has already been used." },
        { status: 409 }
      );
    }

    // ── Check if expired ───────────────────────────────────────
    if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
      return NextResponse.json(
        { ok: false, error: "This invite code has expired." },
        { status: 410 }
      );
    }

    // ── Create membership ──────────────────────────────────────
    const membershipRes = await dbQuery(
      `INSERT INTO seatsync.seatsync_membership
         (account_id, email, name, display_name, company_id, organization_name, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        account.email,
        account.username,
        account.display_name ?? account.username,
        invite.company_id,
        invite.organization_name,
        invite.role,
      ]
    );

    // ── Mark code as used ──────────────────────────────────────
    await dbQuery(
      `UPDATE seatsync.invite_codes
       SET used_by = $1, used_at = NOW()
       WHERE id = $2`,
      [id, invite.id]
    );

    const membership = membershipRes.rows[0];

    return NextResponse.json(
      {
        ok: true,
        membership,
        message: `Successfully joined ${invite.organization_name} as ${invite.role}.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to join SeatSync company:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
