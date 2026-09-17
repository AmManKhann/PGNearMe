import fs from "fs";
import path from "path";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "USER" | "OWNER" | "ADMIN";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDB(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf-8");
}

function readAll(): StoredUser[] {
  ensureDB();
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeAll(users: StoredUser[]): void {
  ensureDB();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function getUserByEmail(email: string): StoredUser | undefined {
  const key = email.toLowerCase();
  return readAll().find((u) => u.email === key);
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  role?: "USER" | "OWNER";
}

export function createOrUpdateUser(input: CreateUserInput): StoredUser {
  const all = readAll();
  const key = input.email.toLowerCase();
  const idx = all.findIndex((u) => u.email === key);
  const role = input.role || "USER";
  const now = new Date().toISOString();

  if (idx !== -1) {
    const existing = all[idx];
    const updated: StoredUser = {
      ...existing,
      name: input.name,
      phone: input.phone || existing.phone,
      role: existing.role || role,
    };
    all[idx] = updated;
    writeAll(all);
    return updated;
  }

  const user: StoredUser = {
    id: "u-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    name: input.name,
    email: key,
    phone: input.phone,
    role,
    createdAt: now,
  };
  all.push(user);
  writeAll(all);
  return user;
}