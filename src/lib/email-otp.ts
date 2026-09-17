const VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_GUARD_MS = 30 * 1000; // 30 second resend cooldown

interface EmailOTPRecord {
  code: string;
  expiry: number;
  lastSentAt: number;
}

const pending = new Map<string, EmailOTPRecord>();

export function generateEmailOTP(email: string): string {
  const key = email.toLowerCase();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  pending.set(key, {
    code,
    expiry: Date.now() + VALIDITY_MS,
    lastSentAt: Date.now(),
  });
  return code;
}

export function canResendEmailOTP(email: string): boolean {
  const rec = pending.get(email.toLowerCase());
  if (!rec) return true;
  return Date.now() - rec.lastSentAt >= RESEND_GUARD_MS;
}

export function verifyEmailOTP(email: string, code: string): boolean {
  const key = email.toLowerCase();
  const rec = pending.get(key);
  if (!rec) return false;
  if (Date.now() > rec.expiry) {
    pending.delete(key);
    return false;
  }
  if (rec.code !== code.trim()) return false;
  pending.delete(key);
  return true;
}