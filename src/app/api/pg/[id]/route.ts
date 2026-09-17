import { NextRequest, NextResponse } from "next/server";
import { getPG, updatePG, deletePG, setPGStatus, setPGFeatured, setPGVerified } from "@/lib/store";

type RouteParams = Promise<{ id: string }>;

export async function GET(_request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const listing = getPG(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const body = await request.json();
  const updated = updatePG(id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing: updated });
}

export async function PATCH(request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const body = await request.json();
  let updated = undefined;
  if (body.status !== undefined) updated = setPGStatus(id, body.status);
  if (body.isFeatured !== undefined) updated = setPGFeatured(id, body.isFeatured);
  if (body.isVerified !== undefined) updated = setPGVerified(id, body.isVerified);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const ok = deletePG(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
