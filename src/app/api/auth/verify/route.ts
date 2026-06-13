import { NextResponse } from "next/server";
import {
  verifyAccountEmail,
  AuthInputError,
  markWelcomeEmailSent,
} from "@/lib/server/auth-db";
import { sendWelcomeEmail } from "@/lib/server/email";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing verification token." },
        { status: 400 },
      );
    }

    const account = await verifyAccountEmail(token);

    // Send welcome email now that their email is verified
    try {
      const emailSent = await sendWelcomeEmail({
        to: account.email,
        username: account.display_name || account.username,
      });

      if (emailSent) {
        await markWelcomeEmailSent(account.id);
      }
    } catch (emailError) {
      console.error("Welcome email send failed after verification", emailError);
    }

    return NextResponse.json({
      ok: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    if (error instanceof AuthInputError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Verification failed", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
