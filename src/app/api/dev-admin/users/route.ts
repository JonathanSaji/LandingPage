import { NextResponse } from "next/server";
import {
  deleteAllUsersWithLinkedData,
  deleteUserWithLinkedData,
  DevAdminError,
  previewDeleteAllUsers,
  previewUserDelete,
  verifyDevAdminPassword,
  assertDevAdminEnabled,
} from "@/lib/server/dev-admin";

type Action =
  | "verify"
  | "preview-user"
  | "delete-user"
  | "preview-all"
  | "delete-all";

export async function POST(request: Request) {
  try {
    assertDevAdminEnabled();

    const body = (await request.json()) as {
      action?: Action;
      password?: string;
      username?: string;
    };

    const action = body.action;
    const password = body.password || "";

    if (!action) {
      throw new DevAdminError("Action is required.");
    }

    const passwordValid = verifyDevAdminPassword(password);
    if (!passwordValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid admin password." },
        { status: 401 },
      );
    }

    if (action === "verify") {
      return NextResponse.json({ ok: true });
    }

    if (action === "preview-user") {
      const result = await previewUserDelete(body.username || "");
      return NextResponse.json({ ok: true, result });
    }

    if (action === "delete-user") {
      const result = await deleteUserWithLinkedData(body.username || "");
      return NextResponse.json({ ok: true, result });
    }

    if (action === "preview-all") {
      const result = await previewDeleteAllUsers();
      return NextResponse.json({ ok: true, result });
    }

    if (action === "delete-all") {
      const result = await deleteAllUsersWithLinkedData();
      return NextResponse.json({ ok: true, result });
    }

    throw new DevAdminError("Unsupported action.");
  } catch (error) {
    if (error instanceof DevAdminError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Dev admin action failed", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
