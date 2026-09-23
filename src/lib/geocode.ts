import type { PGRecord } from "./types";
import { CITY_COORDS } from "./geo";

const cityKey = (city?: string) =>
  (city || "").trim().toLowerCase().replace(/[^a-z ]/g, "");

export function cityCoords(city?: string): { lat: number; lng: number } | undefined {
  if (!city) return undefined;
  return CITY_COORDS[cityKey(city)];
}

const GEO_CACHE = new Map<string, { lat: number; lng: number }>();
const GEO_INFLIGHT = new Map<string, Promise<{ lat: number; lng: number } | undefined>>();

async function geocodeAddress(q: string): Promise<{ lat: number; lng: number } | undefined> {
  const cached = GEO_CACHE.get(q);
  if (cached) return cached;
  const inflight = GEO_INFLIGHT.get(q);
  if (inflight) return inflight;
  const task = (async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "pgnearme-web/1.0", Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return undefined;
      const data = (await res.json()) as { lat?: string; lon?: string }[];
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat ?? "");
        const lng = parseFloat(data[0].lon ?? "");
        if (!isNaN(lat) && !isNaN(lng)) {
          const r = { lat, lng };
          GEO_CACHE.set(q, r);
          return r;
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  })();
  GEO_INFLIGHT.set(q, task);
  task.finally(() => GEO_INFLIGHT.delete(q));
  return task;
}

export async function ensureCoordinates(
  records: PGRecord[],
  opts?: { allowNetwork?: boolean }
): Promise<PGRecord[]> {
  const allowNetwork = opts?.allowNetwork ?? records.length <= 500;
  return Promise.all(
    records.map(async (r) => {
      if (typeof r.lat === "number" && typeof r.lng === "number") return r;
      const cur = cityCoords(r.city);
      if (!allowNetwork || cur) return cur ? { ...r, lat: cur.lat, lng: cur.lng } : r;
      const q = [r.locality, r.city, r.state, r.pincode].filter(Boolean).join(", ");
      const coord = await geocodeAddress(q);
      return coord ? { ...r, lat: coord.lat, lng: coord.lng } : r;
    })
  );
}