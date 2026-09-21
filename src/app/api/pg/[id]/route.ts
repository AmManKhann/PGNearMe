import { NextRequest, NextResponse } from "next/server";
import { loadPGRecords, savePGRecords, applyUpdate } from "@/lib/pgdata";
import { loadEngagement } from "@/lib/engagementDB";
import { ensureCoordinates } from "@/lib/geocode";

type RouteParams = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const all = await ensureCoordinates(await loadPGRecords());
  const listing = all.find((l) => l.id === id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const engagement = await loadEngagement();
  const reviews = engagement.reviews.filter((rev) => rev.pgId === id);
  let rating = listing.rating;
  let reviewCount = listing.reviewCount;
  if (reviews.length > 0) {
    rating = Math.round((reviews.reduce((sum, x) => sum + x.rating, 0) / reviews.length) * 10) / 10;
    reviewCount = reviews.length;
  }
  return NextResponse.json(
    {
      listing: { ...listing, rating, reviewCount, likes: engagement.likes[id] ?? listing.likes ?? 0 },
    },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}

export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = { ...body };
  delete patch.id;
  delete patch.createdAt;
  let all = await loadPGRecords();
  const { list, updated } = applyUpdate(all, id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  all = list;
  await savePGRecords(all);
  return NextResponse.json({ listing: updated });
}

export async function PATCH(request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = { ...body };
  delete patch.id;
  delete patch.createdAt;
  let all = await loadPGRecords();
  const { list, updated } = applyUpdate(all, id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  all = list;
  await savePGRecords(all);
  return NextResponse.json({ listing: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const all = await loadPGRecords();
  const next = all.filter((l) => l.id !== id);
  if (next.length === all.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await savePGRecords(next);
  return NextResponse.json({ success: true });
}