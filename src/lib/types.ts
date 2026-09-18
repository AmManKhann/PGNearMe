export type PGStatus = "pending" | "approved" | "rejected";

export interface PGPricingRow {
  type: string;
  price: number;
  meals: string;
}

export interface PGRecord {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  address: string;
  description: string;
  gender: "male" | "female" | "unisex";
  totalBeds: number;
  amenities: string[];
  pricing: PGPricingRow[];
  images: string[];
  videos: string[];
  status: PGStatus;
  ownerName: string;
  isFeatured: boolean;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  likes: number;
  isVerified: boolean;
  occupancy: string;
  sharing: string[];
  phone?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt: string;
}