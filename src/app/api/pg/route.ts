import { NextRequest, NextResponse } from "next/server";
import { filterPGRecords, type PGFilters } from "@/lib/store";
import { loadPGRecords, savePGRecords, buildNewRecord } from "@/lib/pgdata";

type PGRecordGender = "male" | "female" | "unisex";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters: PGFilters = {};
  for (const key of ["status", "featured", "city", "q", "gender", "price", "ownerName"]) {
    const v = searchParams.get(key);
    if (v) (filters as Record<string, string>)[key] = v;
  }
  const records = await loadPGRecords();
  const listings = filterPGRecords(records, filters);
  return NextResponse.json({ listings });
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
    sharing: Array.isArray(body.sharing) ? body.sharing : [],
  });
  const all = await loadPGRecords();
  await savePGRecords([...all, record]);
  return NextResponse.json({ listing: record }, { status: 201 });
}