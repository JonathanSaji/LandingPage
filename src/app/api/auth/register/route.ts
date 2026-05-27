import { NextResponse } from "next/server";
import {
  AuthConflictError,
  AuthInputError,
  createAccount,
} from "@/lib/server/auth-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      email?: string;
      password?: string;
      accountType?: "personal" | "business";
      businessRole?: "ceo" | "employee";
      organizationName?: string;
    };

    const account = await createAccount(body);

    return NextResponse.json({ ok: true, account }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthInputError || error instanceof AuthConflictError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Registration failed", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
