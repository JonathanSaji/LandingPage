import { NextResponse } from "next/server";
import {
  AuthConflictError,
  AuthInputError,
  createAccount,
} from "@/lib/server/auth-db";
import { sendVerificationEmail } from "@/lib/server/email";

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

    const { account, verificationToken } = await createAccount(body);

    try {
      await sendVerificationEmail({
        to: account.email,
        username: account.display_name || account.username,
        token: verificationToken,
      });
    } catch (emailError) {
      console.error("Verification email send failed", emailError);
    }

    return NextResponse.json(
      {
        ok: true,
        account,
        message: "Registration successful! Please check your spam or inbox folder in email to verify your account."
      },
      { status: 201 }
    );
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
