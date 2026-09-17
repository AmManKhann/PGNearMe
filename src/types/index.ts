export type UserRole = "USER" | "OWNER" | "ADMIN";
export type ListingStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Gender = "MALE" | "FEMALE" | "UNISEX";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
}

export interface Listing {
  id: string;
  name: string;
  description?: string;
  city: string;
  locality: string;
  address: string;
  gender: Gender;
  totalBeds: number;
  status: ListingStatus;
  isFeatured: boolean;
  isVerified: boolean;
  occupancy?: string;
  amenities: string[];
  rules: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pricing {
  id: string;
  type: string;
  price: number;
  meals?: string;
  listingId: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface Inquiry {
  id: string;
  message?: string;
  phone?: string;
  status: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface ListingWithDetails extends Listing {
  owner?: User;
  pricing?: Pricing[];
  reviews?: Review[];
  _count?: {
    reviews: number;
    inquiries: number;
  };
}
