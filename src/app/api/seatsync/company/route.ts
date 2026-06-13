import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";
import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, companyName, companyDisplayName } = body as {
      userId?: number;
      companyName?: string;
      companyDisplayName?: string;
    };

    // ── Validation ─────────────────────────────────────────────
    if (!userId || !companyName) {
      return NextResponse.json(
        { ok: false, error: "userId and companyName are required." },
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

    const displayName = (companyDisplayName ?? companyName).trim();
    const name = companyName.trim();

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
        { ok: false, error: "Please verify your email before creating a company." },
        { status: 403 }
      );
    }

    // ── Check the user doesn't already have a SeatSync membership ──
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

    // ── Check company name isn't already taken ──────────────────
    const existingCompany = await dbQuery(
      `SELECT id FROM seatsync.companies WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name]
    );

    if (existingCompany.rows.length > 0) {
      return NextResponse.json(
        { ok: false, error: "A company with that name already exists." },
        { status: 409 }
      );
    }

    // ── Generate a unique company ID (UUID format matching existing schema) ──
    const companyId = crypto.randomUUID();

    // ── Insert company ─────────────────────────────────────────
    const companyRes = await dbQuery(
      `INSERT INTO seatsync.companies (id, name, company_display_name, owner_email, owner_account_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, company_display_name, owner_email, owner_account_id, created_at`,
      [companyId, name, displayName, account.email, id]
    );

    const company = companyRes.rows[0];

    // ── Insert OWNER membership ────────────────────────────────
    const membershipRes = await dbQuery(
      `INSERT INTO seatsync.seatsync_membership
         (account_id, email, name, display_name, company_id, organization_name, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'OWNER')
       RETURNING *`,
      [
        id,
        account.email,
        account.username,
        account.display_name ?? account.username,
        companyId,
        displayName,
      ]
    );

    const membership = membershipRes.rows[0];

    return NextResponse.json(
      { ok: true, company, membership },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create SeatSync company:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
