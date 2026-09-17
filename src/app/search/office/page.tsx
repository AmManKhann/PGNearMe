"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SpaceCard, type SpaceCardListing } from "@/components/SpaceCard";
import { officeListings } from "@/lib/spaces";
import {
  Briefcase,
  Maximize,
  Users,
  Bath,
  Car,
  Search,
  Filter,
} from "lucide-react";

function toCard(office: (typeof officeListings)[number]): SpaceCardListing {
  return {
    id: office.id,
    name: office.name,
    city: office.city,
    locality: office.locality,
    price: office.price,
    images: office.images,
    isAvailable: office.isAvailable,
    furnished: office.furnished,
    furnishedLabel: "Furnished",
    rating: office.rating,
    reviewCount: office.reviewCount,
    likes: office.likes,
    landlord: office.landlord,
    specs: [
      { icon: Maximize, label: `${office.areaSqft} sqft` },
      { icon: Users, label: `${office.seating} seating` },
      { icon: Bath, label: `${office.bathrooms} bath` },
      { icon: Car, label: office.parking ? "Parking" : "No parking" },
    ],
  };
}

export default function OfficeSearchPage() {
  const [searchCity, setSearchCity] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [furnishedFilter, setFurnishedFilter] = useState("all");

  const filtered = useMemo(() => {
    return officeListings
      .filter((o) => {
        if (
          searchCity &&
          !o.city.toLowerCase().includes(searchCity.toLowerCase()) &&
          !o.locality.toLowerCase().includes(searchCity.toLowerCase())
        ) {
          return false;
        }
        if (statusFilter !== "all") {
          if (String(o.isAvailable) !== statusFilter) return false;
        }
        if (furnishedFilter !== "all") {
          if (String(o.furnished) !== furnishedFilter) return false;
        }
        return true;
      })
      .map(toCard);
  }, [searchCity, statusFilter, furnishedFilter]);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-surface-alt border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              {searchCity ? `Offices in ${searchCity}` : "Offices &amp; Workspaces for Rent"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by city or locality..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm search-input focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-muted" />
            <span className="text-sm text-muted font-medium mr-1">Status:</span>
            {[
              { label: "All", value: "all" },
              { label: "Available", value: "true" },
              { label: "Rented", value: "false" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  statusFilter === f.value
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted font-medium mr-1">Fit-out:</span>
            {[
              { label: "All", value: "all" },
              { label: "Furnished", value: "true" },
              { label: "Shell", value: "false" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFurnishedFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  furnishedFilter === f.value
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <SpaceCard key={listing.id} listing={listing} detailHref={(id) => `/search/office/${id}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 animate-float">
              <Briefcase className="w-8 h-8 text-primary/50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Offices Found</h2>
            <p className="text-muted max-w-md mx-auto">
              Try adjusting your filters or search in a different locality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}