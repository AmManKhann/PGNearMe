import fs from "fs";
import path from "path";
import type { PGRecord, PGStatus, PGPricingRow } from "./types";
export type { PGRecord, PGStatus, PGPricingRow };

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "pg.json");

function ensureDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf-8");
  } catch {
    // read-only filesystem (e.g. serverless): persistence handled upstream
  }
}

function readAll(): PGRecord[] {
  ensureDB();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? (parsed as PGRecord[]) : [];
    return list.map((l) => ({
      ...l,
      images: Array.isArray(l.images) ? l.images : [],
      videos: Array.isArray(l.videos) ? l.videos : [],
    }));
  } catch {
    return [];
  }
}

function writeAll(records: PGRecord[]): void {
  ensureDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch {
    // read-only filesystem: persistence handled by caller (remote save)
  }
}

export function getRecords(): PGRecord[] {
  return readAll();
}

export function writeRecords(records: PGRecord[]): void {
  writeAll(records);
}

export interface PGFilters {
  status?: string;
  featured?: string;
  city?: string;
  q?: string;
  gender?: string;
  price?: string;
  ownerName?: string;
}

export function filterPGRecords(list: PGRecord[], filters?: PGFilters): PGRecord[] {
  let filtered = list;
  if (filters) {
    if (filters.status) filtered = filtered.filter((l) => l.status === filters.status);
    if (filters.featured) filtered = filtered.filter((l) => l.isFeatured);
    if (filters.city) {
      const c = filters.city.toLowerCase();
      filtered = filtered.filter((l) => l.city.toLowerCase().includes(c));
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      filtered = filtered.filter((l) =>
        `${l.name} ${l.locality} ${l.city} ${l.address ?? ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (filters.gender) filtered = filtered.filter((l) => l.gender === filters.gender);
    if (filters.price) {
      const [min, max] = filters.price.split("-").map(Number);
      filtered = filtered.filter((l) => l.priceMin >= min && l.priceMax <= max);
    }
    if (filters.ownerName)
      filtered = filtered.filter((l) => l.ownerName === filters.ownerName);
  }
  return filtered;
}

export function getAllPGs(filters?: PGFilters): PGRecord[] {
  return filterPGRecords(readAll(), filters);
}

export function getPG(id: string): PGRecord | undefined {
  return readAll().find((l) => l.id === id);
}

export type CreatePGInput = Pick<
  PGRecord,
  | "name"
  | "city"
  | "locality"
  | "address"
  | "description"
  | "gender"
  | "totalBeds"
  | "amenities"
  | "pricing"
  | "images"
  | "videos"
  | "ownerName"
> & {
  phone?: string;
  lat?: number;
  lng?: number;
  sharing?: string[];
};

export function createPG(input: CreatePGInput): PGRecord {
  const prices: number[] = input.pricing.map((p) => p.price).filter((p) => p > 0);
  const now = new Date().toISOString();
  const record: PGRecord = {
    ...input,
    id: `pg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "pending",
    isFeatured: false,
    priceMin: prices.length > 0 ? Math.min(...prices) : 0,
    priceMax: prices.length > 0 ? Math.max(...prices) : 0,
    rating: 0,
    reviewCount: 0,
    likes: 0,
    isVerified: false,
    occupancy: input.pricing[0]?.type || "Single Sharing",
    sharing: input.sharing || [],
    videos: Array.isArray(input.videos) ? input.videos : [],
    phone: input.phone,
    lat: input.lat,
    lng: input.lng,
    createdAt: now,
    updatedAt: now,
  };
  const all = readAll();
  all.push(record);
  writeAll(all);
  return record;
}

export type UpdatePGInput = Partial<
  Omit<PGRecord, "id" | "createdAt" | "updatedAt">
>;

export function updatePG(id: string, input: UpdatePGInput): PGRecord | null {
  const all = readAll();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const existing = all[idx];
  const updated: PGRecord = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  if (input.pricing) {
    const prices = input.pricing.map((p) => p.price).filter((p) => p > 0);
    updated.priceMin = prices.length > 0 ? Math.min(...prices) : 0;
    updated.priceMax = prices.length > 0 ? Math.max(...prices) : 0;
    updated.occupancy = input.pricing[0]?.type || updated.occupancy;
  }
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function deletePG(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((l) => l.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

export function setPGStatus(id: string, status: PGStatus): PGRecord | null {
  return updatePG(id, { status });
}

export function setPGFeatured(id: string, isFeatured: boolean): PGRecord | null {
  return updatePG(id, { isFeatured });
}

export function setPGVerified(id: string, isVerified: boolean): PGRecord | null {
  return updatePG(id, { isVerified });
}

export function pricingRowsToInput(rows: {
  type: string;
  price: string;
  meals: string;
}[]): PGPricingRow[] {
  return rows
    .filter((r) => r.type.trim() && parseFloat(r.price) > 0)
    .map((r) => ({
      type: r.type.trim(),
      price: parseFloat(r.price),
      meals: r.meals.trim() || "3 meals",
    }));
}