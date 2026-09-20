import fs from "fs";
import path from "path";

export interface StoredReview {
  id: string;
  pgId: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  tags: string[];
  createdAt: string;
}

export interface EngagementData {
  reviews: StoredReview[];
  likes: Record<string, number>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "engagement.json");

const REPO = process.env.GITHUB_REPO?.trim() || "";
const TOKEN = process.env.GITHUB_TOKEN?.trim() || "";
const REMOTE = Boolean(REPO && process.env.VERCEL);

const emptyData: EngagementData = { reviews: [], likes: {} };

const FETCH_TIMEOUT_MS = 8000;

function apiUrl(): string {
  return `https://api.github.com/repos/${REPO}/contents/data/engagement.json`;
}

function ensureDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(emptyData, null, 2), "utf-8");
    }
  } catch {
    // read-only filesystem (e.g. serverless): persistence handled upstream
  }
}

function readDisk(): EngagementData {
  ensureDB();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<EngagementData>;
    return {
      reviews: Array.isArray(parsed.reviews) ? (parsed.reviews as StoredReview[]) : [],
      likes:
        typeof parsed.likes === "object" && parsed.likes !== null
          ? (parsed.likes as Record<string, number>)
          : {},
    };
  } catch {
    return emptyData;
  }
}

function writeDisk(data: EngagementData): void {
  ensureDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // read-only filesystem: persistence handled by caller (remote save)
  }
}

export async function loadEngagement(): Promise<EngagementData> {
  if (!REMOTE) return readDisk();
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
    const parsed = (await res.json()) as Partial<EngagementData>;
    return {
      reviews: Array.isArray(parsed.reviews) ? (parsed.reviews as StoredReview[]) : [],
      likes:
        typeof parsed.likes === "object" && parsed.likes !== null
          ? (parsed.likes as Record<string, number>)
          : {},
    };
  } catch (err) {
    console.error("loadEngagement fallback to disk:", err);
    return readDisk();
  }
}

export async function saveEngagement(data: EngagementData): Promise<void> {
  if (!REMOTE) {
    writeDisk(data);
    return;
  }
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
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
      message: "Update engagement data",
      content,
      sha,
      branch: "main",
    }),
  });
  if (!putRes.ok) {
    throw new Error(`github contents PUT ${putRes.status}`);
  }
}

export interface AddReviewInput {
  pgId: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  tags: string[];
}

export async function addStoredReview(input: AddReviewInput): Promise<StoredReview> {
  const data = await loadEngagement();
  const review: StoredReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    pgId: input.pgId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    rating: input.rating,
    tags: input.tags,
    createdAt: new Date().toISOString(),
  };
  data.reviews = [review, ...data.reviews];
  await saveEngagement(data);
  return review;
}

export async function adjustLikeCount(pgId: string, delta: number): Promise<number> {
  const data = await loadEngagement();
  const current = data.likes[pgId] ?? 0;
  const next = Math.max(0, current + delta);
  data.likes = { ...data.likes, [pgId]: next };
  await saveEngagement(data);
  return next;
}

export async function deleteStoredReview(reviewId: string): Promise<boolean> {
  const data = await loadEngagement();
  const before = data.reviews.length;
  data.reviews = data.reviews.filter((r) => r.id !== reviewId);
  if (data.reviews.length === before) return false;
  await saveEngagement(data);
  return true;
}