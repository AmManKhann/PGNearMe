export interface LatLng {
  lat: number;
  lng: number;
}

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  point1: LatLng,
  point2: LatLng
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function getDistanceKm(
  userLat: number | null | undefined,
  userLng: number | null | undefined,
  pgLat: number | null | undefined,
  pgLng: number | null | undefined
): number | null {
  if (
    userLat === null ||
    userLat === undefined ||
    userLng === null ||
    userLng === undefined ||
    pgLat === null ||
    pgLat === undefined ||
    pgLng === null ||
    pgLng === undefined
  ) {
    return null;
  }
  return haversineDistance(
    { lat: userLat, lng: userLng },
    { lat: pgLat, lng: pgLng }
  );
}