export interface LatLng {
  lat: number;
  lng: number;
}

export const INDIA_CENTER: LatLng = { lat: 20.5937, lng: 78.9629 };

export const CITY_COORDS: Record<string, LatLng> = {
  // fallback city center when a listing has no coordinates
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.391 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  sikar: { lat: 27.6094, lng: 75.1399 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  surat: { lat: 21.1702, lng: 72.8311 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  indore: { lat: 22.7196, lng: 75.8577 },
  patna: { lat: 25.5941, lng: 85.1376 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  vishakhapatnam: { lat: 17.6868, lng: 83.2185 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
};

export function getCityCoords(city?: string | null): LatLng {
  if (!city) return INDIA_CENTER;
  return CITY_COORDS[city.trim().toLowerCase()] ?? INDIA_CENTER;
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