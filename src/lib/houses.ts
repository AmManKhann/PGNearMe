import type { ReviewItem } from "@/lib/engagement";

export interface HouseListing {
  id: number;
  name: string;
  city: string;
  locality: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  furnished: boolean;
  images: string[];
  landlord: { name: string; phone: string };
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  likes: number;
  description: string;
  lat: number;
  lng: number;
}

export const houseListings: HouseListing[] = [
  {
    id: 101,
    name: "Sunset Villa 2BHK",
    city: "Bangalore",
    locality: "Koramangala",
    price: 25000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1100,
    furnished: true,
    images: ["https://picsum.photos/id/101/800/600", "https://picsum.photos/id/102/800/600"],
    landlord: { name: "Rajesh Kumar", phone: "+91 98765 43210" },
    isAvailable: true,
    rating: 4.5,
    reviewCount: 47,
    likes: 128,
    description:
      "Bright 2BHK villa in a quiet Koramangala lane. Fully furnished with modular kitchen, balcony, and 24/7 water supply. Walking distance to 80 Feet Road eateries and metro.",
    lat: 12.9349,
    lng: 77.6225,
  },
  {
    id: 102,
    name: "Greenwood Apartment 3BHK",
    city: "Mumbai",
    locality: "Andheri West",
    price: 45000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1650,
    furnished: false,
    images: ["https://picsum.photos/id/102/800/600"],
    landlord: { name: "Priya Sharma", phone: "+91 87654 32109" },
    isAvailable: true,
    rating: 4.1,
    reviewCount: 33,
    likes: 91,
    description:
      "Semi-furnished 3BHK in a gated society near D.N. Nagar metro. Amenities include gym, kids' play area, and 24/7 security. Ideal for families and working professionals.",
    lat: 19.1364,
    lng: 72.8296,
  },
  {
    id: 103,
    name: "Lakeview Flat 1BHK",
    city: "Pune",
    locality: "Kothrud",
    price: 15000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 650,
    furnished: true,
    images: ["https://picsum.photos/id/103/800/600"],
    landlord: { name: "Amit Deshmukh", phone: "+91 76543 21098" },
    isAvailable: false,
    rating: 4.3,
    reviewCount: 28,
    likes: 76,
    description:
      "Cosy furnished 1BHK close to Karve Road and Symbiosis. Short walk to the lake, cafés, and gyms. Quiet society with covered parking available.",
    lat: 18.5074,
    lng: 73.8077,
  },
  {
    id: 104,
    name: "Riverside House 4BHK",
    city: "Hyderabad",
    locality: "Jubilee Hills",
    price: 55000,
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 2400,
    furnished: true,
    images: ["https://picsum.photos/id/104/800/600", "https://picsum.photos/id/105/800/600"],
    landlord: { name: "Sneha Reddy", phone: "+91 65432 10987" },
    isAvailable: true,
    rating: 4.6,
    reviewCount: 52,
    likes: 143,
    description:
      "Expansive 4BHK independent house with a private garden in Jubilee Hills. Fully furnished interiors, servant quarters, and 3-car parking. Surrounded by top schools.",
    lat: 17.4325,
    lng: 78.3968,
  },
  {
    id: 105,
    name: "City Center Studio 1BHK",
    city: "Delhi",
    locality: "Lajpat Nagar",
    price: 18000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 550,
    furnished: false,
    images: ["https://picsum.photos/id/105/800/600"],
    landlord: { name: "Vikram Singh", phone: "+91 54321 09876" },
    isAvailable: true,
    rating: 4.0,
    reviewCount: 19,
    likes: 58,
    description:
      "Compact semi-furnished studio in Lajpat Nagar market hub. Perfect for bachelors — metro, markets, and restaurants all within walking distance.",
    lat: 28.5677,
    lng: 77.2405,
  },
  {
    id: 106,
    name: "Hilltop Apartment 2BHK",
    city: "Chennai",
    locality: "Adyar",
    price: 22000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 950,
    furnished: true,
    images: ["https://picsum.photos/id/106/800/600"],
    landlord: { name: "Kavitha Nair", phone: "+91 43210 98765" },
    isAvailable: false,
    rating: 4.4,
    reviewCount: 41,
    likes: 112,
    description:
      "Sea-breeze 2BHK on the Adyar hillside with open terrace. Furnished home near IIT Madras, Besant Nagar beach, and good schools — ideal for families.",
    lat: 13.0061,
    lng: 80.2573,
  },
];

export const houseReviews: Record<number, ReviewItem[]> = {
  101: [
    {
      id: "h101-1",
      author: "Nikhil P.",
      rating: 5,
      date: "1 week ago",
      tags: ["Spacious & Well-Ventilated Rooms", "Excellent Location & Connectivity"],
    },
    {
      id: "h101-2",
      author: "Divya R.",
      rating: 4,
      date: "3 weeks ago",
      tags: ["Friendly Owner & Staff", "High-Speed Wi-Fi"],
    },
  ],
  104: [
    {
      id: "h104-1",
      author: "Arjun M.",
      rating: 5,
      date: "2 weeks ago",
      tags: ["Best PG with cleanliness", "Safe & Secure Environment"],
    },
  ],
};

export function getHouseById(id: string) {
  return houseListings.find((h) => String(h.id) === id) ?? null;
}