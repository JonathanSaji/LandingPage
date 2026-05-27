import { NextResponse } from "next/server";
import { AuthInputError, loginWithPassword } from "@/lib/server/auth-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identifier?: string;
      password?: string;
    };

    const account = await loginWithPassword(body);

    return NextResponse.json({ ok: true, account });
  } catch (error) {
    if (error instanceof AuthInputError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Login failed", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
