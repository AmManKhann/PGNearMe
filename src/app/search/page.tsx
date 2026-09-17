"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { PGCard } from "@/components/PGCard";
import { SortDropdown, type SortValue } from "@/components/SortDropdown";
import { toPGListing } from "@/lib/listings";
import type { PGRecord } from "@/lib/types";
import { getDistanceKm } from "@/lib/geo";
import { hasAmenity, hasFood, amenityOptions } from "@/lib/filterOptions";
import { ArrowUpDown, Navigation } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const city = searchParams.get("city") ?? "";
  const query = searchParams.get("q") ?? "";
  const gender = searchParams.get("gender") ?? "";
  const priceRange = searchParams.get("price") ?? "";
  const budgetParam = searchParams.get("budget");
  const budget = budgetParam ? parseInt(budgetParam, 10) : null;
  const sharing = (searchParams.get("sharing") ?? "").split(",").filter(Boolean);
  const amenities = (searchParams.get("amenities") ?? "").split(",").filter(Boolean);
  const food = searchParams.get("food") === "1";
  const verifiedOnly = searchParams.get("verified") === "1";
  const userLat = parseFloat(searchParams.get("lat") ?? "");
  const userLng = parseFloat(searchParams.get("lng") ?? "");
  const hasLocation = !isNaN(userLat) && !isNaN(userLng);
  const sortParam = searchParams.get("sort") as SortValue | null;
  const sort: SortValue = sortParam ?? (hasLocation ? "nearest" : "newest");

  const [records, setRecords] = useState<PGRecord[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "approved");
    fetch(`/api/pg?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setRecords(d.listings || []))
      .catch(() => setRecords([]));
  }, []);

  const results = useMemo(() => {
    const all = records.map((l) => ({
      ...toPGListing(l),
      distance: getDistanceKm(userLat, userLng, l.lat, l.lng),
    }));

    let filtered = all;

    if (city) {
      filtered = filtered.filter((l) => l.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (l) => l.name.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q)
      );
    }
    if (gender) {
      filtered = filtered.filter((l) => l.gender === gender);
    }
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((l) => l.priceMin >= min && l.priceMax <= max);
    }
    if (budget) {
      filtered = filtered.filter((l) => l.priceMin <= budget);
    }
    if (sharing.length > 0) {
      filtered = filtered.filter((l) => l.sharing && l.sharing.some((s) => sharing.includes(s)));
    }
    if (food) {
      filtered = filtered.filter((l) => hasFood(l.amenities));
    }
    if (amenities.length > 0) {
      filtered = filtered.filter((l) =>
        amenities.every((a) => {
          const opt = amenityOptions.find((o) => o.value === a);
          return opt ? hasAmenity(l.amenities, opt.match) : true;
        })
      );
    }
    if (verifiedOnly) {
      filtered = filtered.filter((l) => l.isVerified);
    }

    if (sort === "price-asc") {
      filtered.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => b.priceMin - a.priceMin);
    } else if (sort === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === "newest") {
      const createdById: Record<string, string> = {};
      for (const r of records) createdById[r.id] = r.createdAt;
      filtered.sort(
        (a, b) =>
          new Date(createdById[b.id] ?? 0).getTime() -
          new Date(createdById[a.id] ?? 0).getTime()
      );
    } else if (hasLocation) {
      filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return filtered;
  }, [city, query, gender, priceRange, budget, food, verifiedOnly, userLat, userLng, hasLocation, sort, sharing, amenities, records]);

  const updateSort = (value: SortValue) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sort", value);
    router.replace(`/search?${sp.toString()}`, { scroll: false });
  };

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
            <h1 className="text-2xl font-bold text-foreground">
              {city ? `PGs in ${city}` : "All PG Listings"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {results.length} listing{results.length !== 1 ? "s" : ""} found
              {hasLocation && (
                <span className="ml-2 inline-flex items-center gap-1 text-secondary font-medium">
                  <Navigation className="w-3 h-3" />
                  sorted by nearest
                </span>
              )}
            </p>
          </div>
          <SortDropdown value={sort} onChange={updateSort} hasLocation={hasLocation} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="lg:w-72 shrink-0">
            <Suspense fallback={null}>
              <SearchFilters />
            </Suspense>
          </div>

          {results.length > 0 ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((listing) => (
                <PGCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex-1 text-center py-20">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 animate-float">
                <ArrowUpDown className="w-8 h-8 text-primary/50" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No PGs Found</h2>
              <p className="text-muted max-w-md mx-auto">
                Try adjusting your filters or search in a different city.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}