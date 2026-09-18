import { NextRequest, NextResponse } from "next/server";
import {
  loadEngagement,
  addStoredReview,
  type StoredReview,
} from "@/lib/engagementDB";
import { isValidEmail, isValidPhone } from "@/lib/auth";

function publicReview(r: StoredReview) {
  return {
    id: r.id,
    pgId: r.pgId,
    author: r.name,
    rating: r.rating,
    tags: r.tags,
    date: r.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const pgId = request.nextUrl.searchParams.get("pgId");

  if (pgId) {
    const data = await loadEngagement();
    const reviews = data.reviews.filter((r) => r.pgId === pgId);
    return NextResponse.json({
      reviews: reviews.map(publicReview),
      likeCount: data.likes[pgId] ?? 0,
    });
  }

  const role = request.cookies.get("pgnearme_role")?.value;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await loadEngagement();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const pgId = typeof body.pgId === "string" ? body.pgId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const rating = Number(body.rating);
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t: unknown): t is string => typeof t === "string")
    : [];

  if (!pgId) {
    return NextResponse.json({ error: "Listing reference is missing." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit phone number." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }
  if (tags.length === 0) {
    return NextResponse.json({ error: "Select at least one highlight." }, { status: 400 });
  }

  const review = await addStoredReview({ pgId, name, phone, email, rating, tags });
  return NextResponse.json({ review: publicReview(review) }, { status: 201 });
}