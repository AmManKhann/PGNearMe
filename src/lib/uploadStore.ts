import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const REPO = process.env.GITHUB_REPO?.trim() || "";
const TOKEN = process.env.GITHUB_TOKEN?.trim() || "";
const REMOTE = Boolean(REPO && TOKEN && process.env.VERCEL);

function fileApiUrl(filename: string): string {
  return `https://api.github.com/repos/${REPO}/contents/data/uploads/${encodeURIComponent(
    filename
  )}`;
}

function ensureDir(dir: string): void {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {
    // read-only filesystem (serverless): remote persistence used instead
  }
}

export async function saveUpload(filename: string, buffer: Buffer): Promise<void> {
  if (!REMOTE) {
    ensureDir(UPLOAD_DIR);
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    return;
  }
  const content = buffer.toString("base64");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "pgnearme",
  };
  let sha: string | undefined;
  const getRes = await fetch(fileApiUrl(filename), {
    headers: {
      ...headers,
      Accept: "application/vnd.github+json",
    },
  });
  if (getRes.ok) {
    try {
      const meta = (await getRes.json()) as { sha?: string };
      sha = meta.sha;
    } catch {
      sha = undefined;
    }
  }
  const putRes = await fetch(fileApiUrl(filename), {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Upload media ${filename}`,
      content,
      sha,
      branch: "main",
    }),
  });
  if (!putRes.ok) {
    throw new Error(`github contents PUT ${putRes.status}`);
  }
}

export async function loadUpload(filename: string): Promise<Buffer | null> {
  if (!REMOTE) {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath);
  }
  try {
    const res = await fetch(fileApiUrl(filename), {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github.raw+json",
        "User-Agent": "pgnearme",
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}