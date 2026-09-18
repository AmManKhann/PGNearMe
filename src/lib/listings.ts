import type { PGRecord } from "./types";

export interface PGListing {
  id: string;
  name: string;
  city: string;
  state?: string;
  pincode?: string;
  locality: string;
  address: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  likes?: number;
  gender: "male" | "female" | "unisex";
  images: string[];
  videos?: string[];
  amenities: string[];
  phone?: string;
  whatsapp?: string;
  website?: string;
  isVerified: boolean;
  isFeatured: boolean;
  occupancy: string;
  sharing?: string[];
  lat?: number;
  lng?: number;
  distance?: number | null;
}

export function toPGListing(
  record: PGRecord,
  distance: number | null = null
): PGListing {
  return {
    id: record.id,
    name: record.name,
    city: record.city,
    state: record.state,
    pincode: record.pincode,
    locality: record.locality,
    address: record.address,
    priceMin: record.priceMin,
    priceMax: record.priceMax,
    rating: record.rating,
    reviewCount: record.reviewCount,
    likes: record.likes,
    gender: record.gender,
    images: record.images,
    videos: record.videos,
    amenities: record.amenities,
    isVerified: record.isVerified,
    isFeatured: record.isFeatured,
    occupancy: record.occupancy,
    sharing: record.sharing,
    phone: record.phone,
    whatsapp: record.whatsapp,
    website: record.website,
    lat: record.lat,
    lng: record.lng,
    distance,
  };
}

export interface CityCard {
  name: string;
  count: number;
  imageId: number;
}

export const topCities: CityCard[] = [
  { name: "Bangalore", count: 2500, imageId: 1048 },
  { name: "Mumbai", count: 2100, imageId: 1044 },
  { name: "Delhi", count: 1900, imageId: 1025 },
  { name: "Pune", count: 1500, imageId: 1059 },
  { name: "Hyderabad", count: 1200, imageId: 1063 },
  { name: "Chennai", count: 1000, imageId: 1036 },
];