import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth";
import {
  canResendEmailOTP,
  generateEmailOTP,
} from "@/lib/email-otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (!canResendEmailOTP(email)) {
    return NextResponse.json(
      { error: "Please wait before requesting another code." },
      { status: 429 }
    );
  }

  const code = generateEmailOTP(email);
  const result = await sendOtpEmail(email, code);

  if (!result.sent) {
    // Dev/demo mode fallback: expose the code so the flow works without a mail provider.
    return NextResponse.json(
      { ok: true, provider: result.provider, devCode: result.devCode },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true, provider: result.provider });
}