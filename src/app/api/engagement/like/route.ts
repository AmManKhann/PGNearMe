import { NextRequest, NextResponse } from "next/server";
import { loadEngagement, adjustLikeCount } from "@/lib/engagementDB";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const pgId = typeof body.pgId === "string" ? body.pgId.trim() : "";
  const delta = Number(body.delta);

  if (!pgId) {
    return NextResponse.json({ error: "Listing reference is missing." }, { status: 400 });
  }
  if (!Number.isInteger(delta) || (delta !== 1 && delta !== -1)) {
    return NextResponse.json({ error: "delta must be 1 or -1." }, { status: 400 });
  }

  await loadEngagement();
  try {
    const likeCount = await adjustLikeCount(pgId, delta);
    return NextResponse.json({ likeCount });
  } catch (err) {
    console.error("adjustLikeCount failed:", err);
    const data = await loadEngagement();
    return NextResponse.json({ likeCount: data.likes[pgId] ?? 0 });
  }
}