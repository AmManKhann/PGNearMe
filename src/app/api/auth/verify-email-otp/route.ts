import { NextRequest, NextResponse } from "next/server";
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  lookupUser,
} from "@/lib/auth";
import { verifyEmailOTP } from "@/lib/email-otp";
import { getUserByEmail, createOrUpdateUser } from "@/lib/users";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const requestedRole = body?.role === "OWNER" ? "OWNER" : "USER";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Please enter the 6-digit code." },
      { status: 400 }
    );
  }
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 }
    );
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit mobile number." },
      { status: 400 }
    );
  }

  if (!verifyEmailOTP(email, code)) {
    return NextResponse.json(
      { error: "Incorrect or expired code. Please try again." },
      { status: 400 }
    );
  }

  // Existing account in the persistent user store
  const stored = getUserByEmail(email);
  if (stored) {
    const session = {
      id: stored.id,
      name: name || stored.name,
      email: stored.email,
      phone: stored.phone,
      role: stored.role,
    };
    return NextResponse.json({ ok: true, user: session, existing: true });
  }

  // Existing demo account (non-admin) → authenticate directly
  const demo = lookupUser(email);
  if (demo) {
    if (demo.role === "ADMIN") {
      return NextResponse.json(
        { error: "This email is reserved for admin use. Please use the admin portal instead." },
        { status: 403 }
      );
    }
    const session = {
      id: demo.id,
      name: demo.name,
      email: demo.email,
      phone: demo.phone,
      role: demo.role,
    };
    return NextResponse.json({ ok: true, user: session, existing: true });
  }

  // New account → create with the requested role
  const user = createOrUpdateUser({
    name,
    email,
    phone: normalizePhone(phone),
    role: requestedRole,
  });

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  return NextResponse.json({ ok: true, user: session, existing: false });
}