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

    // ── Dev alias: userId=999 resolves to user1 ────────────────
    if (userId === 999) {
      const userRes = await dbQuery(
        "SELECT id FROM accounts WHERE username = 'user1' LIMIT 1"
      );
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    // ── Fetch account from public.accounts ─────────────────────
    const accountRes = await dbQuery(
      `SELECT id, username, email, display_name FROM accounts WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (accountRes.rows.length === 0) {
      return NextResponse.json({ ok: true, membership: null });
    }

    const { username, email, display_name: displayName } = accountRes.rows[0];

    // ── Primary lookup: by account_id (authoritative) ──────────
    let membershipRes = await dbQuery(
      `SELECT
          email,
          name,
          display_name,
          max_allowed_days,
          company_id,
          organization_name,
          role,
          account_id
       FROM seatsync.seatsync_membership
       WHERE account_id = $1
       LIMIT 1`,
      [userId]
    );

    // ── Legacy fallback: match by email/display_name ───────────
    // (for rows created before the account_id migration)
    if (membershipRes.rows.length === 0) {
      membershipRes = await dbQuery(
        `SELECT
            email,
            name,
            display_name,
            max_allowed_days,
            company_id,
            organization_name,
            role,
            account_id
         FROM seatsync.seatsync_membership
         WHERE display_name = $1
            OR email = $2
            OR email = $3
         LIMIT 1`,
        [username, email, `${username}@seatsync.dev`]
      );

      // Fallback on display_name if it differs from username
      if (membershipRes.rows.length === 0 && displayName && displayName !== username) {
        membershipRes = await dbQuery(
          `SELECT
              email,
              name,
              display_name,
              max_allowed_days,
              company_id,
              organization_name,
              role,
              account_id
           FROM seatsync.seatsync_membership
           WHERE display_name = $1
           LIMIT 1`,
          [displayName]
        );
      }

      // If we found a legacy row, backfill account_id for next time
      if (membershipRes.rows.length > 0 && !membershipRes.rows[0].account_id) {
        await dbQuery(
          `UPDATE seatsync.seatsync_membership
           SET account_id = $1
           WHERE email = $2 AND account_id IS NULL`,
          [userId, membershipRes.rows[0].email]
        ).catch(() => {
          // Non-fatal: best effort backfill
        });
      }
    }

    if (membershipRes.rows.length === 0) {
      return NextResponse.json({ ok: true, membership: null });
    }

    let membership = membershipRes.rows[0];

    // ── Resolve OWNER role via companies.owner_account_id ──────
    let isOwner = false;
    if (membership.company_id) {
      const companyRes = await dbQuery(
        `SELECT owner_email, owner_account_id
         FROM seatsync.companies
         WHERE id = $1
         LIMIT 1`,
        [membership.company_id]
      );
      if (companyRes.rows.length > 0) {
        const company = companyRes.rows[0];
        // Check by account_id first (authoritative), fall back to owner_email
        isOwner =
          company.owner_account_id === userId ||
          company.owner_email === membership.email;
      }
    }

    const resolvedRole = isOwner ? "OWNER" : membership.role;
    membership = { ...membership, role: resolvedRole };

    // ── Role-specific data ─────────────────────────────────────
    let ownerData = null;
    let adminData = null;
    let employeeData = null;

    if (resolvedRole === "OWNER") {
      const orgRes = await dbQuery(
        `SELECT company_display_name AS organization_name, total_employees, total_admins
         FROM seatsync.organization_stats
         WHERE company_id = $1
         LIMIT 1`,
        [membership.company_id]
      );
      ownerData = orgRes.rows[0] ?? null;
    } else if (resolvedRole === "ADMIN") {
      const adminRes = await dbQuery(
        `SELECT employee_name, current_month_bookings, meets_minimum_criteria
         FROM seatsync.admin_employee_details
         WHERE company_id = $1`,
        [membership.company_id]
      );
      adminData = adminRes.rows ?? [];
    } else {
      const empRes = await dbQuery(
        `SELECT booking_date, floor_number, seat_identifier
         FROM seatsync.employee_bookings
         WHERE employee_email = $1
           AND booking_date >= CURRENT_DATE
         ORDER BY booking_date ASC`,
        [membership.email]
      );
      employeeData = empRes.rows ?? [];
    }

    return NextResponse.json({
      ok: true,
      membership: {
        ...membership,
        ownerData,
        adminData,
        employeeData,
      },
    });
  } catch (error) {
    console.error("Failed to fetch SeatSync membership:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
