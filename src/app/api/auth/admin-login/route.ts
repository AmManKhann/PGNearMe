import { NextRequest, NextResponse } from "next/server";
import type { UserSession } from "@/lib/auth";

const ADMIN_EMAIL = "admin@pgnearme.com";
const ADMIN_PASSWORD = "admin123";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid admin credentials." },
      { status: 401 }
    );
  }

  const session: UserSession = {
    id: "a1",
    name: "Admin",
    email: ADMIN_EMAIL,
    role: "ADMIN",
  };

  return NextResponse.json({ ok: true, user: session });
}