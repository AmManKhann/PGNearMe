import type { PGRecord, PGStatus } from "./types";
import { getRecords, writeRecords } from "./store";

const REPO = process.env.GITHUB_REPO?.trim() || "";
const TOKEN = process.env.GITHUB_TOKEN?.trim() || "";
const REMOTE = Boolean(REPO && process.env.VERCEL);

export function isRemote(): boolean {
  return REMOTE;
}

const FETCH_TIMEOUT_MS = 8000;
const REMOTE_CACHE_TTL_MS = 60_000;

function apiUrl(): string {
  return `https://api.github.com/repos/${REPO}/contents/data/pg.json`;
}

let remoteCache: PGRecord[] | null = null;
let remoteCacheAt = 0;
let remoteInflight: Promise<PGRecord[]> | null = null;

function fetchRemoteRecords(): Promise<PGRecord[]> {
  const now = Date.now();
  if (remoteCache && now - remoteCacheAt < REMOTE_CACHE_TTL_MS) {
    return Promise.resolve(remoteCache);
  }
  if (!remoteInflight) {
    remoteInflight = (async () => {
      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github.raw+json",
          "User-Agent": "pgnearme",
        };
        if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
        const res = await fetch(apiUrl(), {
          cache: "no-store",
          headers,
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`contents fetch ${res.status}`);
        const parsed: unknown = await res.json();
        remoteCache = Array.isArray(parsed) ? (parsed as PGRecord[]) : [];
        remoteCacheAt = Date.now();
        return remoteCache;
      } catch (err) {
        console.error("loadPGRecords fallback to disk:", err);
        return getRecords();
      }
    })().finally(() => {
      remoteInflight = null;
    });
  }
  return remoteInflight;
}

export async function loadPGRecords(): Promise<PGRecord[]> {
  if (!REMOTE) return getRecords();
  return fetchRemoteRecords();
}

export async function savePGRecords(records: PGRecord[]): Promise<void> {
  if (!REMOTE) {
    writeRecords(records);
    return;
  }
  const content = Buffer.from(JSON.stringify(records, null, 2)).toString("base64");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "pgnearme",
  };
  let sha: string | undefined;
  const getRes = await fetch(apiUrl(), {
    headers: { ...headers, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (getRes.ok) {
    try {
      const meta = (await getRes.json()) as { sha?: string };
      sha = meta.sha;
    } catch {
      sha = undefined;
    }
  }
  const putRes = await fetch(apiUrl(), {
    method: "PUT",
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    body: JSON.stringify({
      message: "Update PG listing data",
      content,
      sha,
      branch: "main",
    }),
  });
  if (!putRes.ok) {
    throw new Error(`github contents PUT ${putRes.status}`);
  }
  remoteCache = null;
}

type CreateLike = Omit<
  PGRecord,
  | "id"
  | "status"
  | "isFeatured"
  | "priceMin"
  | "priceMax"
  | "rating"
  | "reviewCount"
  | "likes"
  | "isVerified"
  | "occupancy"
  | "createdAt"
  | "updatedAt"
>;

export function buildNewRecord(input: CreateLike): PGRecord {
  const prices: number[] = (input.pricing || []).map((p) => p.price).filter((p) => p > 0);
  const now = new Date().toISOString();
  return {
    ...input,
    id: `pg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "pending" as PGStatus,
    isFeatured: false,
    priceMin: prices.length > 0 ? Math.min(...prices) : 0,
    priceMax: prices.length > 0 ? Math.max(...prices) : 0,
    rating: 0,
    reviewCount: 0,
    likes: 0,
    isVerified: false,
    occupancy: input.pricing?.[0]?.type || "Single Sharing",
    createdAt: now,
    updatedAt: now,
  };
}

export function applyUpdate(
  list: PGRecord[],
  id: string,
  patch: Record<string, unknown>
): { list: PGRecord[]; updated: PGRecord | null } {
  const idx = list.findIndex((l) => l.id === id);
  if (idx === -1) return { list, updated: null };
  const existing = list[idx];
  const next = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  } as PGRecord;
  if (Array.isArray(patch.pricing)) {
    const prices = (patch.pricing as { price: number }[])
      .map((p) => p.price)
      .filter((p) => p > 0);
    next.priceMin = prices.length > 0 ? Math.min(...prices) : 0;
    next.priceMax = prices.length > 0 ? Math.max(...prices) : 0;
    next.occupancy = (patch.pricing as { type: string }[])[0]?.type || next.occupancy;
  }
  const out = [...list];
  out[idx] = next;
  return { list: out, updated: next };
}