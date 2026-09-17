import { NextRequest, NextResponse } from "next/server";
import { getAllPGs, createPG } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters: Record<string, string> = {};
  for (const key of ["status", "featured", "city", "q", "gender", "price", "ownerName"]) {
    const v = searchParams.get(key);
    if (v) filters[key] = v;
  }
  const listings = getAllPGs(Object.keys(filters).length ? filters : undefined);
  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const record = createPG({
    name: body.name || "",
    city: body.city || "",
    locality: body.locality || "",
    address: body.address || "",
    description: body.description || "",
    gender: body.gender || "unisex",
    totalBeds: Number(body.totalBeds) || 0,
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    pricing: Array.isArray(body.pricing) ? body.pricing : [],
    images: Array.isArray(body.images) ? body.images : [],
    videos: Array.isArray(body.videos) ? body.videos : [],
    ownerName: body.ownerName || "",
    phone: body.phone || undefined,
    sharing: Array.isArray(body.sharing) ? body.sharing : [],
    lat: body.lat ? Number(body.lat) : undefined,
    lng: body.lng ? Number(body.lng) : undefined,
  });
  return NextResponse.json({ listing: record }, { status: 201 });
}
