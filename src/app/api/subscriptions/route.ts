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

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId parameter." },
        { status: 400 }
      );
    }

    const result = await dbQuery(
      `SELECT 
        id, 
        name, 
        amount, 
        date, 
        color, 
        "billingCycle", 
        "subscriptionType", 
        "isTrial", 
        "amountPerCycle", 
        "personalValue"
       FROM subscriptions
       WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ ok: true, subscriptions: result.rows });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
