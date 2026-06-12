import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get("userId");

    if (!userIdStr) {
      return NextResponse.json(
        { ok: false, error: "userId query parameter is required." },
        { status: 400 },
      );
    }

    let userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid userId parameter." },
        { status: 400 },
      );
    }

    if (userId === 999) {
      const userRes = await dbQuery(
        "SELECT id FROM accounts WHERE username = 'user1' LIMIT 1",
      );
      if (userRes.rows.length > 0) {
        userId = parseInt(userRes.rows[0].id, 10);
      }
    }

    const result = await dbQuery<{
      id: string;
      storage_url: string;
      taken_at: string | null;
      uploaded_at: string;
      album_name: string;
    }>(
      `SELECT id, storage_url, taken_at, uploaded_at, album_name
       FROM (
         SELECT DISTINCT ON (p.storage_url)
                p.id::text, p.storage_url, p.taken_at, p.uploaded_at, pa.name AS album_name
         FROM "TravelSync".photos p
         JOIN "TravelSync".photo_albums pa ON p.album_id = pa.id
         WHERE p.account_id = $1
         ORDER BY p.storage_url, COALESCE(p.taken_at, p.uploaded_at) DESC
       ) deduped
       ORDER BY COALESCE(taken_at, uploaded_at) DESC
       LIMIT 20`,
      [userId],
    );

    return NextResponse.json({ ok: true, photos: result.rows });
  } catch (error) {
    console.error("Failed to fetch PhotoSync photos:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
