import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId is required." },
        { status: 400 }
      );
    }

    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId." },
        { status: 400 }
      );
    }

    // Delete subscriptions first to prevent foreign key constraint violations
    await dbQuery(`DELETE FROM subscriptions WHERE user_id = $1`, [id]);

    // Delete account
    const result = await dbQuery(`DELETE FROM accounts WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
