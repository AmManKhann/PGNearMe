"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Star } from "lucide-react";
import type { PGRecord } from "@/lib/types";

export function FeaturedListings() {
  const [listings, setListings] = useState<PGRecord[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ status: "approved", featured: "1" });
    fetch(`/api/pg?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setListings((d.listings || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  if (listings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/pg/${listing.id}`}
          className="bg-surface rounded-xl border border-border overflow-hidden card-hover group"
        >
          <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-b border-border">
            <Building2 className="w-12 h-12 text-primary/30 group-hover:text-primary-light/50 transition-colors" />
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground group-hover:text-primary-light transition-colors">{listing.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-medium">{listing.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted">
              <MapPin className="w-3.5 h-3.5" />
              {listing.locality}, {listing.city}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {listing.amenities.slice(0, 3).map((a) => (
                <span key={a} className="text-xs bg-surface px-2 py-0.5 rounded text-muted border border-border">
                  {a}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <span className="font-bold text-lg text-foreground">
                ₹{listing.priceMin.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted">/month</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}