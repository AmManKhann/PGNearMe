import { NextRequest, NextResponse } from "next/server";
import { loadPGRecords, savePGRecords, applyUpdate } from "@/lib/pgdata";

type RouteParams = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const all = await loadPGRecords();
  const listing = all.find((l) => l.id === id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
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