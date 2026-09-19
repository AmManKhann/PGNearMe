import { NextRequest, NextResponse } from "next/server";
import { filterPGRecords, type PGFilters } from "@/lib/store";
import { loadPGRecords, savePGRecords, buildNewRecord } from "@/lib/pgdata";
import { loadEngagement } from "@/lib/engagementDB";

type PGRecordGender = "male" | "female" | "unisex";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters: PGFilters = {};
  for (const key of ["status", "featured", "city", "q", "gender", "price", "ownerName"]) {
    const v = searchParams.get(key);
    if (v) (filters as Record<string, string>)[key] = v;
  }
  const records = await loadPGRecords();
  const engagement = await loadEngagement();
  const listings = filterPGRecords(records, filters).map((r) => {
    const reviews = engagement.reviews.filter((rev) => rev.pgId === r.id);
    let rating = r.rating;
    let reviewCount = r.reviewCount;
    if (reviews.length > 0) {
      rating = Math.round((reviews.reduce((sum, x) => sum + x.rating, 0) / reviews.length) * 10) / 10;
      reviewCount = reviews.length;
    }
    return {
      ...r,
      rating,
      reviewCount,
      likes: engagement.likes[r.id] ?? r.likes ?? 0,
    };
  });
  const ipLat = request.headers.get("x-vercel-ip-latitude");
  const ipLng = request.headers.get("x-vercel-ip-longitude");
  const clientLocation =
    ipLat && ipLng && Number.isFinite(Number(ipLat)) && Number.isFinite(Number(ipLng))
      ? { lat: Number(ipLat), lng: Number(ipLng) }
      : undefined;
  return NextResponse.json({ listings, clientLocation });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const record = buildNewRecord({
    name: String(body.name || ""),
    city: String(body.city || ""),
    state: String(body.state || ""),
    pincode: String(body.pincode || ""),
    locality: String(body.locality || ""),
    address: String(body.address || ""),
    description: String(body.description || ""),
    gender: String(body.gender || "unisex") as PGRecordGender,
    totalBeds: Number(body.totalBeds) || 0,
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    pricing: Array.isArray(body.pricing) ? body.pricing : [],
    images: Array.isArray(body.images) ? body.images : [],
    videos: Array.isArray(body.videos) ? body.videos : [],
    ownerName: String(body.ownerName || ""),
    phone: typeof body.phone === "string" ? body.phone : undefined,
    whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : undefined,
    website: typeof body.website === "string" ? body.website : undefined,
    mapsUrl: typeof body.mapsUrl === "string" ? body.mapsUrl : undefined,
    lat:
      typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : undefined,
    lng:
      typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : undefined,
    sharing: Array.isArray(body.sharing) ? body.sharing : [],
  });
  const all = await loadPGRecords();
  await savePGRecords([...all, record]);
  return NextResponse.json({ listing: record }, { status: 201 });
}