export function parseMapsCoords(url: string): { lat: number; lng: number } | null {
  const u = (url ?? "").trim();
  if (!u) return null;

  // Standard "place" share links centre the view on @lat,lng.
  const at = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,\d+(?:\.\d+)?[a-z])?/);
  if (at) return { lat: Number(at[1]), lng: Number(at[2]) };

  // !3d<lat>!4d<lng> is the place marker block in classic share links.
  const place3 = u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (place3) return { lat: Number(place3[1]), lng: Number(place3[2]) };

  // Directions-style links carry multiple !1d<lng>!2d<lat> pairs; the LAST one is the destination.
  const place12 = [...u.matchAll(/!1d(-?\d+\.\d+)!2d(-?\d+\.\d+)/g)];
  if (place12.length > 0) {
    const last = place12[place12.length - 1];
    return { lat: Number(last[2]), lng: Number(last[1]) };
  }

  const q = u.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (q) return { lat: Number(q[1]), lng: Number(q[2]) };
  const dest = u.match(/[?&]destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (dest) return { lat: Number(dest[1]), lng: Number(dest[2]) };
  return null;
}