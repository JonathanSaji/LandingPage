import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";
import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, companyId, role, expiresInHours } = body as {
      userId?: number;
      companyId?: string;
      role?: "ADMIN" | "EMPLOYEE";
      expiresInHours?: number;
    };

    // ── Validation ─────────────────────────────────────────────
    if (!userId || !companyId || !role) {
      return NextResponse.json(
        { ok: false, error: "userId, companyId, and role are required." },
        { status: 400 }
      );
    }

    if (!["ADMIN", "EMPLOYEE"].includes(role)) {
      return NextResponse.json(
        { ok: false, error: "role must be 'ADMIN' or 'EMPLOYEE'." },
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

    // ── Fetch the requester's membership ───────────────────────
    const membershipRes = await dbQuery(
      `SELECT sm.role, c.owner_account_id
       FROM seatsync.seatsync_membership sm
       JOIN seatsync.companies c ON c.id = sm.company_id
       WHERE sm.account_id = $1
         AND sm.company_id = $2
       LIMIT 1`,
      [id, companyId]
    );

    if (membershipRes.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "You are not a member of this company." },
        { status: 403 }
      );
    }

    const requester = membershipRes.rows[0];
    const resolvedRole =
      requester.owner_account_id === id ? "OWNER" : requester.role;

    // ── Permission check ───────────────────────────────────────
    // OWNER can generate both ADMIN and EMPLOYEE codes
    // ADMIN can only generate EMPLOYEE codes
    if (resolvedRole === "EMPLOYEE") {
      return NextResponse.json(
        { ok: false, error: "Employees cannot generate invite codes." },
        { status: 403 }
      );
    }

    if (resolvedRole === "ADMIN" && role === "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "Only the company OWNER can generate admin codes." },
        { status: 403 }
      );
    }

    // ── Generate unique code: ROLE-COMPANYPREFIX-RANDOM ───────
    const companyPrefix = companyId.split("-")[0].toUpperCase(); // first 8 chars of UUID
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const code = `${role.slice(0, 3)}-${companyPrefix}-${randomSuffix}`;

    // ── Calculate expiry (default 7 days) ──────────────────────
    const hours = expiresInHours ?? 168; // 7 days
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // ── Insert invite code ─────────────────────────────────────
    const insertRes = await dbQuery(
      `INSERT INTO seatsync.invite_codes (company_id, code, role, created_by, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, code, role, expires_at, created_at`,
      [companyId, code, role, id, expiresAt]
    );

    const invite = insertRes.rows[0];

    return NextResponse.json(
      {
        ok: true,
        invite,
        message: `${role} invite code generated. Expires in ${hours} hours.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to generate invite code:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
