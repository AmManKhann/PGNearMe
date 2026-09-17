"use client";

import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/LikeButton";
import {
  MapPin,
  IndianRupee,
  Star,
  Phone,
  Navigation,
  type LucideIcon,
} from "lucide-react";

export interface SpaceCardSpec {
  icon: LucideIcon;
  label: string;
}

export interface SpaceCardListing {
  id: number;
  name: string;
  city: string;
  locality: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  furnished?: boolean;
  furnishedLabel?: string;
  rating: number;
  reviewCount: number;
  likes: number;
  landlord: { name: string; phone: string };
  specs: SpaceCardSpec[];
}

export function SpaceCard({
  listing,
  detailHref,
}: {
  listing: SpaceCardListing;
  detailHref: (id: number) => string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all group">
      <Link href={detailHref(listing.id)} className="block">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={listing.images[0]}
            alt={listing.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          <span
            className={`absolute top-14 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
              listing.isAvailable ? "bg-available text-white" : "bg-red-500/90 text-white"
            }`}
          >
            {listing.isAvailable ? "Available" : "Rented"}
          </span>
          {listing.furnished && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-white">
              {listing.furnishedLabel ?? "Furnished"}
            </span>
          )}
          <div className="absolute top-3 right-3">
            <LikeButton entityId={listing.id} seedCount={listing.likes} size="sm" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-base font-bold text-foreground group-hover:text-primary-light transition-colors">
              {listing.name}
            </h3>
            <p className="text-sm text-muted flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {listing.locality}, {listing.city}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-primary font-bold text-lg">
              <IndianRupee className="w-4 h-4" />
              {listing.price.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted">/month</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-medium">{listing.rating.toFixed(1)}</span>
              <span className="text-xs text-muted">({listing.reviewCount})</span>
            </div>
          </div>

          {listing.specs.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              {listing.specs.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-primary-light" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-surface-alt border border-border flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{listing.landlord.name.charAt(0)}</span>
          </div>
          <span className="text-sm text-muted">{listing.landlord.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${listing.locality}, ${listing.city}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-all neon-glow"
          >
            <Navigation className="w-3.5 h-3.5" />
            Map
          </a>
          <a
            href={`tel:${listing.landlord.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}