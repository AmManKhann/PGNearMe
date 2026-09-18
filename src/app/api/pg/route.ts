import { NextRequest, NextResponse } from "next/server";
import { filterPGRecords, type PGFilters } from "@/lib/store";
import { loadPGRecords, savePGRecords, buildNewRecord } from "@/lib/pgdata";
import { getCityCoords } from "@/lib/geo";

type PGRecordGender = "male" | "female" | "unisex";

async function resolveCoords(body: Record<string, unknown>): Promise<{
  lat?: number;
  lng?: number;
}> {
  if (body.lat && body.lng) {
    return { lat: Number(body.lat), lng: Number(body.lng) };
  }
  try {
    const q = [
      body.locality,
      body.city,
      body.state ? `${body.state}${body.pincode ? ` ${body.pincode}` : ""}` : "",
      "India",
    ]
      .filter(Boolean)
      .join(", ");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "pgnearme-site/1.0 (supportpgnearme@gmail.com)",
        },
      }
    );
    const data = (await res.json()) as { lat?: string; lon?: string }[] | undefined;
    if (Array.isArray(data) && data[0]?.lat) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    }
  } catch {
    /* fall through to city center */
  }
  const fb = getCityCoords(String(body.city || ""));
  return { lat: fb.lat, lng: fb.lng };
}

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
  const coords = await resolveCoords(body);
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
    sharing: Array.isArray(body.sharing) ? body.sharing : [],
    lat: coords.lat,
    lng: coords.lng,
  });
  const all = await loadPGRecords();
  await savePGRecords([...all, record]);
  return NextResponse.json({ listing: record }, { status: 201 });
}