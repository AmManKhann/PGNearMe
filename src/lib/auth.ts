export interface UserSession {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "USER" | "OWNER" | "ADMIN";
}

export interface OTPData {
  code: string;
  target: string;
  expiry: number;
}

const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").replace(/^\+/, "").replace(/^91/, "");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

export function getTargetType(target: string): "email" | "phone" | null {
  if (isValidEmail(target)) return "email";
  if (isValidPhone(target)) return "phone";
  return null;
}

// Store pending OTPs in memory (maps to out-of-process store / DB in production)
const otpStore = new Map<string, OTPData>();

export function createOTP(target: string): string {
  const code = generateOTP();
  otpStore.set(target, {
    code,
    target,
    expiry: Date.now() + OTP_VALIDITY_MS,
  });
  return code;
}

export function verifyOTP(target: string, code: string): boolean {
  const record = otpStore.get(target);
  if (!record) return false;
  if (Date.now() > record.expiry) {
    otpStore.delete(target);
    return false;
  }
  if (record.code !== code) return false;
  otpStore.delete(target);
  return true;
}

// Demo store so login/register flows work without a backend
export const demoUsers: { [key: string]: UserSession } = {
  "demo@user.com": {
    id: "u1",
    name: "User",
    email: "demo@user.com",
    role: "USER",
  },
  "demo@owner.com": {
    id: "u2",
    name: "Demo Owner",
    email: "demo@owner.com",
    phone: "9876543210",
    role: "OWNER",
  },
  "admin@pgnearme.com": {
    id: "a1",
    name: "Admin",
    email: "admin@pgnearme.com",
    role: "ADMIN",
  },
};

export function lookupUser(target: string): UserSession | undefined {
  const normalized =
    getTargetType(target) === "phone"
      ? normalizePhone(target)
      : target.toLowerCase();
  const direct = demoUsers[normalized] || demoUsers[target.toLowerCase()];
  if (direct) return direct;
  return Object.values(demoUsers).find(
    (u) => u.phone && normalizePhone(u.phone) === normalized
  );
}

export function autoLogin(target: string): UserSession {
  const normalized = normalizePhone(target);
  return {
    id: "new-" + Date.now(),
    name: getTargetType(target) === "phone" ? normalized : target.split("@")[0],
    email: getTargetType(target) === "email" ? target : undefined,
    phone: getTargetType(target) === "phone" ? normalized : undefined,
    role: "USER",
  };
}