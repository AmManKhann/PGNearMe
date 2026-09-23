import { NextRequest, NextResponse } from "next/server";
import { filterPGRecords, type PGFilters } from "@/lib/store";
import { loadPGRecords, savePGRecords, buildNewRecord } from "@/lib/pgdata";
import { loadEngagement } from "@/lib/engagementDB";
import { ensureCoordinates } from "@/lib/geocode";
import { getDistanceKm } from "@/lib/geo";
import { hasAmenity, hasFood, amenityOptions } from "@/lib/filterOptions";

type PGRecordGender = "male" | "female" | "unisex";

const IP_LOCATION_TTL_MS = 6 * 60 * 60 * 1000;
const ipLocationCache = new Map<string, { lat: number; lng: number; at: number }>();

function clientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (headers.get("x-real-ip") || "").trim();
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

async function lookupIpLocation(
  ip: string
): Promise<{ lat: number; lng: number } | undefined> {
  const cached = ipLocationCache.get(ip);
  if (cached && Date.now() - cached.at < IP_LOCATION_TTL_MS) {
    return { lat: cached.lat, lng: cached.lng };
  }
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
    };
    if (
      data.success &&
      typeof data.latitude === "number" &&
      typeof data.longitude === "number"
    ) {
      ipLocationCache.set(ip, { lat: data.latitude, lng: data.longitude, at: Date.now() });
      return { lat: data.latitude, lng: data.longitude };
    }
  } catch {
    /* geolocation lookup unavailable */
  }
  return undefined;
}

async function resolveClientLocation(
  request: NextRequest
): Promise<{ lat: number; lng: number } | undefined> {
  const headers = request.headers;
  const ipLat = headers.get("x-vercel-ip-latitude");
  const ipLng = headers.get("x-vercel-ip-longitude");
  if (ipLat && ipLng && Number.isFinite(Number(ipLat)) && Number.isFinite(Number(ipLng))) {
    return { lat: Number(ipLat), lng: Number(ipLng) };
  }
  const cfLat = headers.get("cf-iplatitude");
  const cfLng = headers.get("cf-iplongitude");
  if (cfLat && cfLng && Number.isFinite(Number(cfLat)) && Number.isFinite(Number(cfLng))) {
    return { lat: Number(cfLat), lng: Number(cfLng) };
  }
  const ip = clientIp(headers);
  if (isPrivateIp(ip)) return undefined;
  return lookupIpLocation(ip);
}

/** Records above this size skip network geocoding (city-map coords only). */
const NETWORK_GEOCODE_MAX = 500;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters: PGFilters = {};
  for (const key of ["status", "featured", "city", "q", "gender", "price", "ownerName"]) {
    const v = searchParams.get(key);
    if (v) (filters as Record<string, string>)[key] = v;
  }

  // Feed filters (applied after PGFilters)
  const verified = searchParams.get("verified");
  const food = searchParams.get("food");
  const sharing = searchParams.get("sharing");
  const amenitiesParam = searchParams.get("amenities");
  const priceMaxRaw = searchParams.get("priceMax");

  // Pagination & sort
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");
  const hasPage = pageRaw !== null || limitRaw !== null;
  const sort = searchParams.get("sort");

  const allRecords = await loadPGRecords();
  const records = await ensureCoordinates(allRecords, {
    allowNetwork: allRecords.length <= NETWORK_GEOCODE_MAX,
  });

  let list = filterPGRecords(records, filters);
  if (verified === "1") list = list.filter((r) => r.isVerified);
  if (food === "1") list = list.filter((r) => hasFood(r.amenities));
  if (sharing) {
    const wanted = new Set(sharing.split(",").filter(Boolean));
    list = list.filter((r) => (r.sharing || []).some((s) => wanted.has(s)));
  }
  if (amenitiesParam) {
    const wanted = amenitiesParam.split(",").filter(Boolean);
    list = list.filter((r) =>
      wanted.every((a) => {
        const opt = amenityOptions.find((o) => o.value === a);
        return opt ? hasAmenity(r.amenities, opt.match) : true;
      })
    );
  }
  const priceMax = priceMaxRaw !== null && priceMaxRaw.trim() !== "" ? Number(priceMaxRaw) : NaN;
  if (Number.isFinite(priceMax)) list = list.filter((r) => r.priceMin <= priceMax);

  const engagement = await loadEngagement();
  const clientLocation = await resolveClientLocation(request);
  let origin = clientLocation;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const pLat = latParam !== null && latParam.trim() !== "" ? Number(latParam) : NaN;
  const pLng = lngParam !== null && lngParam.trim() !== "" ? Number(lngParam) : NaN;
  if (Number.isFinite(pLat) && Number.isFinite(pLng)) origin = { lat: pLat, lng: pLng };

  const items = list.map((r) => {
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
      distanceKm:
        origin !== undefined
          ? getDistanceKm(origin.lat, origin.lng, r.lat, r.lng)
          : null,
    };
  });

  const shouldSort = hasPage || sort !== null;
  if (shouldSort) {
    if (sort === "price-asc") {
      items.sort((a, b) => a.priceMin - b.priceMin);
    } else {
      items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
  }

  if (!hasPage) {
    return NextResponse.json(
      { listings: items, clientLocation },
      { headers: { "Cache-Control": "private, max-age=60" } }
    );
  }

  const limit = Math.min(Math.max(Number(limitRaw) || 12, 1), 50);
  const page = Math.max(Number(pageRaw) || 1, 1);
  const total = items.length;
  const paged = items.slice((page - 1) * limit, page * limit);
  return NextResponse.json(
    {
      listings: paged,
      total,
      page,
      limit,
      hasMore: page * limit < total,
      clientLocation,
    },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
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