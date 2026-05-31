import { NextResponse } from "next/server";
import {
  AuthConflictError,
  AuthInputError,
  createAccount,
  markWelcomeEmailSent,
} from "@/lib/server/auth-db";
import { sendWelcomeEmail } from "@/lib/server/email";

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

    try {
      const emailSent = await sendWelcomeEmail({
        to: account.email,
        username: account.display_name || account.username,
      });

      if (emailSent) {
        await markWelcomeEmailSent(account.id);
      }
    } catch (emailError) {
      console.error("Welcome email send failed", emailError);
    }

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
