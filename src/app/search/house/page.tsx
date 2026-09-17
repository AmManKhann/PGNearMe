"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { LikeButton } from "@/components/LikeButton";
import { houseListings } from "@/lib/houses";
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  IndianRupee,
  Phone,
  Search,
  Filter,
  Navigation,
  Star,
} from "lucide-react";

const bedroomFilters = [
  { label: "All", value: "all" },
  { label: "1 BHK", value: "1" },
  { label: "2 BHK", value: "2" },
  { label: "3 BHK", value: "3" },
  { label: "4 BHK+", value: "4" },
];

const furnishedFilters = [
  { label: "All", value: "all" },
  { label: "Furnished", value: "true" },
  { label: "Unfurnished", value: "false" },
];

export default function HouseSearchPage() {
  const [searchCity, setSearchCity] = useState("");
  const [bedroomFilter, setBedroomFilter] = useState("all");
  const [furnishedFilter, setFurnishedFilter] = useState("all");

  const filtered = useMemo(() => {
    return houseListings.filter((h) => {
      if (
        searchCity &&
        !h.city.toLowerCase().includes(searchCity.toLowerCase()) &&
        !h.locality.toLowerCase().includes(searchCity.toLowerCase())
      ) {
        return false;
      }
      if (bedroomFilter !== "all") {
        const filterBeds = parseInt(bedroomFilter);
        if (filterBeds === 4 ? h.bedrooms < 4 : h.bedrooms !== filterBeds) {
          return false;
        }
      }
      if (furnishedFilter !== "all") {
        if (String(h.furnished) !== furnishedFilter) return false;
      }
      return true;
    });
  }, [searchCity, bedroomFilter, furnishedFilter]);

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
              <Home className="w-6 h-6 text-primary" />
              {searchCity ? `Houses in ${searchCity}` : "Houses &amp; Flats for Rent"}
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
            <span className="text-sm text-muted font-medium mr-1">BHK:</span>
            {bedroomFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setBedroomFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  bedroomFilter === f.value
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted font-medium mr-1">Status:</span>
            {furnishedFilters.map((f) => (
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
            {filtered.map((house) => (
              <div
                key={house.id}
                className="bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all group"
              >
                <Link href={`/search/house/${house.id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={house.images[0]}
                      alt={house.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                    <span
                      className={`absolute top-14 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        house.isAvailable
                          ? "bg-available text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {house.isAvailable ? "Available" : "Rented"}
                    </span>
                    {house.furnished && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-white">
                        Furnished
                      </span>
                    )}
                    <div className="absolute top-3 right-3">
                      <LikeButton entityId={house.id} seedCount={house.likes} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary-light transition-colors">
                        {house.name}
                      </h3>
                      <p className="text-sm text-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {house.locality}, {house.city}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-primary font-bold text-lg">
                        <IndianRupee className="w-4 h-4" />
                        {house.price.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-muted">/month</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-medium">{house.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted">({house.reviewCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4 text-primary-light" />
                        {house.bedrooms} BHK
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-primary-light" />
                        {house.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="w-4 h-4 text-primary-light" />
                        {house.areaSqft} sqft
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="px-4 pb-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-alt border border-border flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {house.landlord.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-muted">{house.landlord.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${house.locality}, ${house.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-all neon-glow"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Map
                    </a>
                    <a
                      href={`tel:${house.landlord.phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 animate-float">
              <Home className="w-8 h-8 text-primary/50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Houses Found
            </h2>
            <p className="text-muted max-w-md mx-auto">
              Try adjusting your filters or search in a different locality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
