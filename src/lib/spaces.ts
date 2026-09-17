import type { ReviewItem } from "@/lib/engagement";

export interface CommercialSpace {
  id: number;
  name: string;
  city: string;
  locality: string;
  price: number;
  areaSqft: number;
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

export interface OfficeListing extends CommercialSpace {
  seating: number;
  bathrooms: number;
  furnished: boolean;
  parking: boolean;
}

export interface ShopListing extends CommercialSpace {
  frontage: number;
  powerThreePhase: boolean;
  highStreet: boolean;
  bathroom: boolean;
}

export const officeListings: OfficeListing[] = [
  {
    id: 201,
    name: "TechWorks Executive Suite",
    city: "Bangalore",
    locality: "Koramangala",
    price: 45000,
    areaSqft: 850,
    images: ["https://picsum.photos/id/201/800/600", "https://picsum.photos/id/202/800/600"],
    landlord: { name: "Vikram Mehta", phone: "+91 99887 76655" },
    isAvailable: true,
    rating: 4.6,
    reviewCount: 38,
    likes: 104,
    description:
      "Fully furnished executive office in Koramangala 4th Block. Private cabins, conference room, high-speed WiFi, and 24/7 power backup. 25-seat capacity with dedicated parking.",
    lat: 12.9352,
    lng: 77.6245,
    seating: 25,
    bathrooms: 1,
    furnished: true,
    parking: true,
  },
  {
    id: 202,
    name: "Skyline Business Hub",
    city: "Mumbai",
    locality: "Bandra Kurla Complex",
    price: 85000,
    areaSqft: 1200,
    images: ["https://picsum.photos/id/203/800/600"],
    landlord: { name: "Rohan Desai", phone: "+91 88999 00112" },
    isAvailable: true,
    rating: 4.3,
    reviewCount: 29,
    likes: 76,
    description:
      "Semi-furnished office space in a Grade-A tower at BKC. Modular cabins, pantry, and visitor parking. Walking distance to metro and premium hotels.",
    lat: 19.0641,
    lng: 72.8699,
    seating: 35,
    bathrooms: 2,
    furnished: false,
    parking: true,
  },
  {
    id: 203,
    name: "Innov8 Co-working Floor",
    city: "Pune",
    locality: "Hinjewadi",
    price: 30000,
    areaSqft: 700,
    images: ["https://picsum.photos/id/204/800/600", "https://picsum.photos/id/205/800/600"],
    landlord: { name: "Neha Kulkarni", phone: "+91 77889 90011" },
    isAvailable: false,
    rating: 4.7,
    reviewCount: 52,
    likes: 143,
    description:
      "Plug-and-play office on the Hinjewadi IT corridor. Open workstations, meeting pods, cafeteria access, and monthly rentals. Ideal for startups.",
    lat: 18.5913,
    lng: 73.7395,
    seating: 20,
    bathrooms: 1,
    furnished: true,
    parking: true,
  },
  {
    id: 204,
    name: "Garden Court Office (2nd Floor)",
    city: "Hyderabad",
    locality: "HITEC City",
    price: 55000,
    areaSqft: 1000,
    images: ["https://picsum.photos/id/206/800/600"],
    landlord: { name: "Sameer Khan", phone: "+91 66778 89900" },
    isAvailable: true,
    rating: 4.1,
    reviewCount: 21,
    likes: 58,
    description:
      "Shell office space ready for custom fit-out in HITEC City. High ceilings, floor-wise AC provision, and 2 car parks. Surrounded by tech parks.",
    lat: 17.4434,
    lng: 78.3761,
    seating: 30,
    bathrooms: 2,
    furnished: false,
    parking: true,
  },
  {
    id: 205,
    name: "CBD Smart Office",
    city: "Delhi",
    locality: "Nehru Place",
    price: 60000,
    areaSqft: 650,
    images: ["https://picsum.photos/id/207/800/600"],
    landlord: { name: "Arun Wadhwa", phone: "+91 55667 78899" },
    isAvailable: true,
    rating: 4.4,
    reviewCount: 33,
    likes: 91,
    description:
      "Compact smart office in the heart of Nehru Place's IT cluster. Ready-to-move IT-enabled space with structured cabling and secured entry.",
    lat: 28.5503,
    lng: 77.253,
    seating: 18,
    bathrooms: 1,
    furnished: false,
    parking: true,
  },
  {
    id: 206,
    name: "Marina Business Lounge",
    city: "Chennai",
    locality: "T. Nagar",
    price: 40000,
    areaSqft: 600,
    images: ["https://picsum.photos/id/208/800/600"],
    landlord: { name: "Lakshmi Venkatesh", phone: "+91 44556 67788" },
    isAvailable: false,
    rating: 4.5,
    reviewCount: 27,
    likes: 67,
    description:
      "Furnished office lounge near Pondy Bazaar. Glass-partitioned cabins, pantry, and reception area. No parking, 200m from metro station.",
    lat: 13.0399,
    lng: 80.2415,
    seating: 15,
    bathrooms: 1,
    furnished: true,
    parking: false,
  },
];

export const shopListings: ShopListing[] = [
  {
    id: 301,
    name: "Sparkle Corner Retail Shop",
    city: "Bangalore",
    locality: "Jayanagar",
    price: 35000,
    areaSqft: 400,
    images: ["https://picsum.photos/id/301/800/600"],
    landlord: { name: "Girish Hegde", phone: "+91 99887 76655" },
    isAvailable: true,
    rating: 4.4,
    reviewCount: 31,
    likes: 82,
    description:
      "Corner retail unit on 4th Block Jayanagar main road. 15 ft frontage with roller shutters, 3-phase power, and attached restroom. Huge footfall area.",
    lat: 12.93,
    lng: 77.584,
    frontage: 15,
    powerThreePhase: true,
    highStreet: true,
    bathroom: true,
  },
  {
    id: 302,
    name: "Metro Facing Showroom",
    city: "Mumbai",
    locality: "Linking Road",
    price: 60000,
    areaSqft: 550,
    images: ["https://picsum.photos/id/302/800/600", "https://picsum.photos/id/303/800/600"],
    landlord: { name: "Farah Merchant", phone: "+91 88999 00112" },
    isAvailable: true,
    rating: 4.6,
    reviewCount: 44,
    likes: 126,
    description:
      "Landmark showroom facing Linking Road with glass facade. 20 ft frontage, mezzanine storage, 3-phase power, and washroom. Prime retail location.",
    lat: 19.0606,
    lng: 72.8292,
    frontage: 20,
    powerThreePhase: true,
    highStreet: true,
    bathroom: true,
  },
  {
    id: 303,
    name: "FC Road Market Unit",
    city: "Pune",
    locality: "Deccan Gymkhana",
    price: 28000,
    areaSqft: 320,
    images: ["https://picsum.photos/id/303/800/600"],
    landlord: { name: "Suresh Pardeshi", phone: "+91 77889 90011" },
    isAvailable: false,
    rating: 4.2,
    reviewCount: 19,
    likes: 49,
    description:
      "Compact shop right off FC Road food-and-fashion stretch. 12 ft frontage, standard single-phase power, attached storage room behind.",
    lat: 18.5246,
    lng: 73.8507,
    frontage: 12,
    powerThreePhase: false,
    highStreet: true,
    bathroom: false,
  },
  {
    id: 304,
    name: "High Street Boutique Unit",
    city: "Hyderabad",
    locality: "Banjara Hills",
    price: 40000,
    areaSqft: 450,
    images: ["https://picsum.photos/id/304/800/600"],
    landlord: { name: "Rekha Rao", phone: "+91 66778 89900" },
    isAvailable: true,
    rating: 4.5,
    reviewCount: 36,
    likes: 97,
    description:
      "Boutique-ready unit on Road No. 12, Banjara Hills. 14 ft frontage, glass display windows, 3-phase power, AC ducting, and washroom.",
    lat: 17.4145,
    lng: 78.44,
    frontage: 14,
    powerThreePhase: true,
    highStreet: true,
    bathroom: true,
  },
  {
    id: 305,
    name: "Colony Shop with Godown",
    city: "Delhi",
    locality: "Lajpat Nagar",
    price: 25000,
    areaSqft: 380,
    images: ["https://picsum.photos/id/305/800/600"],
    landlord: { name: "Manoj Bansal", phone: "+91 55667 78899" },
    isAvailable: true,
    rating: 4.0,
    reviewCount: 17,
    likes: 41,
    description:
      "Interior-lane shop with attached godown in Lajpat Nagar market. 10 ft frontage, single-phase power, roll-down shutter, residential area customer base.",
    lat: 28.5677,
    lng: 77.2405,
    frontage: 10,
    powerThreePhase: false,
    highStreet: false,
    bathroom: false,
  },
  {
    id: 306,
    name: "Gated Society Corner Shop",
    city: "Chennai",
    locality: "Velachery",
    price: 22000,
    areaSqft: 300,
    images: ["https://picsum.photos/id/306/800/600"],
    landlord: { name: "Karthik Subramanian", phone: "+91 44556 67788" },
    isAvailable: false,
    rating: 4.3,
    reviewCount: 24,
    likes: 63,
    description:
      "Corner shop inside a gated community near Phoenix Market City. 10 ft frontage, 3-phase power, no washroom. Perfect for a grocery or salon.",
    lat: 12.9816,
    lng: 80.2182,
    frontage: 10,
    powerThreePhase: true,
    highStreet: false,
    bathroom: false,
  },
];

export const officeReviews: Record<number, ReviewItem[]> = {
  201: [
    {
      id: "o201-1",
      author: "Shreya N.",
      rating: 5,
      date: "1 week ago",
      tags: ["High-Speed Wi-Fi", "24/7 Power Backup & Water Supply"],
    },
  ],
  204: [
    {
      id: "o204-1",
      author: "Imran Q.",
      rating: 4,
      date: "3 weeks ago",
      tags: ["Affordable & Value for Money", "Excellent Location & Connectivity"],
    },
  ],
};

export const shopReviews: Record<number, ReviewItem[]> = {
  302: [
    {
      id: "s302-1",
      author: "Aditi P.",
      rating: 5,
      date: "2 weeks ago",
      tags: ["Excellent Location & Connectivity", "Friendly Owner & Staff"],
    },
  ],
  306: [
    {
      id: "s306-1",
      author: "Venkat R.",
      rating: 4,
      date: "1 month ago",
      tags: ["Affordable & Value for Money", "Safe & Secure Environment"],
    },
  ],
};

export function getOfficeById(id: string) {
  return officeListings.find((o) => String(o.id) === id) ?? null;
}

export function getShopById(id: string) {
  return shopListings.find((s) => String(s.id) === id) ?? null;
}