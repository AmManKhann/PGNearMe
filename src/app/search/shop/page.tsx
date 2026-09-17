"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SpaceCard, type SpaceCardListing } from "@/components/SpaceCard";
import { shopListings } from "@/lib/spaces";
import {
  Store,
  Maximize,
  Ruler,
  Zap,
  Tag,
  Search,
  Filter,
} from "lucide-react";

function toCard(shop: (typeof shopListings)[number]): SpaceCardListing {
  return {
    id: shop.id,
    name: shop.name,
    city: shop.city,
    locality: shop.locality,
    price: shop.price,
    images: shop.images,
    isAvailable: shop.isAvailable,
    rating: shop.rating,
    reviewCount: shop.reviewCount,
    likes: shop.likes,
    landlord: shop.landlord,
    specs: [
      { icon: Maximize, label: `${shop.areaSqft} sqft` },
      { icon: Ruler, label: `${shop.frontage} ft frontage` },
      { icon: Zap, label: shop.powerThreePhase ? "3-phase" : "Std power" },
      { icon: Tag, label: shop.highStreet ? "High street" : "Local market" },
    ],
  };
}

export default function ShopSearchPage() {
  const [searchCity, setSearchCity] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stormKeyword, setStormKeyword] = useState("all");

  const filtered = useMemo(() => {
    return shopListings
      .filter((s) => {
        if (
          searchCity &&
          !s.city.toLowerCase().includes(searchCity.toLowerCase()) &&
          !s.locality.toLowerCase().includes(searchCity.toLowerCase())
        ) {
          return false;
        }
        if (statusFilter !== "all") {
          if (String(s.isAvailable) !== statusFilter) return false;
        }
        if (stormKeyword === "highstreet" && !s.highStreet) return false;
        if (stormKeyword === "powerthree" && !s.powerThreePhase) return false;
        return true;
      })
      .map(toCard);
  }, [searchCity, statusFilter, stormKeyword]);

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
              <Store className="w-6 h-6 text-primary" />
              {searchCity ? `Shops in ${searchCity}` : "Shops &amp; Retail Units for Rent"}
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
            <span className="text-sm text-muted font-medium mr-1">Type:</span>
            {[
              { label: "All", value: "all" },
              { label: "High street", value: "highstreet" },
              { label: "3-phase power", value: "powerthree" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStormKeyword(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  stormKeyword === f.value
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
              <SpaceCard key={listing.id} listing={listing} detailHref={(id) => `/search/shop/${id}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 animate-float">
              <Store className="w-8 h-8 text-primary/50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Shops Found</h2>
            <p className="text-muted max-w-md mx-auto">
              Try adjusting your filters or search in a different locality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}