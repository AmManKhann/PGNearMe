"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Navigation,
  MapPin,
  Loader2,
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  BadgeCheck,
} from "lucide-react";
import { PGCard } from "@/components/PGCard";
import { SearchBar } from "@/components/SearchBar";
import { SortDropdown, type SortValue } from "@/components/SortDropdown";
import { toPGListing, type PGListing } from "@/lib/listings";
import type { PGRecord } from "@/lib/types";
import { getDistanceKm } from "@/lib/geo";
import { CITY_SELECT_EVENT } from "@/lib/searchFocus";
import { hasAmenity, hasFood, budgetOptions, sharingOptions, amenityOptions } from "@/lib/filterOptions";

type LocationStatus = "locating" | "granted" | "denied" | "idle";

interface Filters {
  verified: boolean;
  budget: string;
  sharing: string[];
  food: boolean;
  amenities: string[];
}

const emptyFilters: Filters = {
  verified: false,
  budget: "",
  sharing: [],
  food: false,
  amenities: [],
};

const geolocationSupported =
  typeof navigator !== "undefined" && "geolocation" in navigator;

export function LivePGFeed() {
  const [records, setRecords] = useState<PGRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<LocationStatus>("locating");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams({ status: "approved" });
    fetch(`/api/pg?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setRecords(d.listings || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!geolocationSupported) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
        setSort((prev) => (prev === "newest" ? "nearest" : prev));
      },
      () => {
        setStatus("denied");
        setBannerDismissed(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    const onCitySelect = (e: Event) => {
      const city = (e as CustomEvent<string>).detail;
      if (!city) return;
      setQuery(city);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(CITY_SELECT_EVENT, onCitySelect);
    return () => window.removeEventListener(CITY_SELECT_EVENT, onCitySelect);
  }, []);

  const createdAtById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of records) map[r.id] = r.createdAt;
    return map;
  }, [records]);

  const locationOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const r of records) {
      const label = `${r.locality}, ${r.city}`.trim();
      if (label && label !== "," && !seen.has(label)) {
        seen.add(label);
        options.push(label);
      }
    }
    return options;
  }, [records]);

  const activeFilterCount =
    (filters.verified ? 1 : 0) +
    (filters.budget ? 1 : 0) +
    filters.sharing.length +
    (filters.food ? 1 : 0) +
    filters.amenities.length;

  const listings = useMemo<PGListing[]>(() => {
    const q = query.trim().toLowerCase();
    const budget = filters.budget ? Number(filters.budget) : null;

    const filtered = records.filter((r) => {
      if (
        q &&
        !`${r.name} ${r.locality} ${r.city} ${r.address ?? ""}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      if (filters.verified && !r.isVerified) return false;
      if (budget !== null && r.priceMin > budget) return false;
      if (filters.sharing.length > 0 && !(r.sharing || []).some((s) => filters.sharing.includes(s))) {
        return false;
      }
      if (filters.food && !hasFood(r.amenities)) return false;
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => {
          const opt = amenityOptions.find((o) => o.value === a);
          return opt ? hasAmenity(r.amenities, opt.match) : true;
        })
      ) {
        return false;
      }
      return true;
    });

    const mapped = filtered.map((r) =>
      toPGListing(r, getDistanceKm(coords?.lat, coords?.lng, r.lat, r.lng))
    );

    switch (sort) {
      case "price-asc":
        mapped.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case "price-desc":
        mapped.sort((a, b) => b.priceMin - a.priceMin);
        break;
      case "rating":
        mapped.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        mapped.sort(
          (a, b) =>
            new Date(createdAtById[b.id] ?? 0).getTime() -
            new Date(createdAtById[a.id] ?? 0).getTime()
        );
        break;
      case "nearest":
      default:
        if (coords) {
          mapped.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }
        break;
    }

    return mapped;
  }, [records, query, filters, sort, coords, createdAtById]);

  const handleSearch = ({
    city,
    lat,
    lng,
  }: {
    city: string;
    lat?: number;
    lng?: number;
  }) => {
    setQuery(city);
    if (lat !== undefined && lng !== undefined) {
      setCoords({ lat, lng });
      setStatus("granted");
      setSort("nearest");
    }
  };

  const showBanner =
    (status === "denied" || !geolocationSupported) && !bannerDismissed;

  const requestLocation = () => {
    setBannerDismissed(false);
    if (!geolocationSupported) return;
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
        setSort("nearest");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const toggleArrayFilter = (key: "sharing" | "amenities", value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-x-hidden">
      {/* Search + sort + filter controls */}
      <div className="mb-8">
        <div className="min-w-0">
          <SearchBar
            onSearch={handleSearch}
            locationOptions={locationOptions}
            showNearMe={false}
            className="max-w-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={requestLocation}
            disabled={status === "locating"}
            className={`min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all bg-surface ${
              coords
                ? "bg-secondary/10 text-secondary border-secondary/30"
                : "text-muted border-border hover:text-foreground hover:border-secondary/40"
            } disabled:opacity-50`}
          >
            {status === "locating" ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
            ) : (
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            )}
            <span className="truncate">{status === "locating" ? "Locating..." : "Near Me"}</span>
          </button>
          <button
            onClick={() => setFiltersOpen(true)}
            className={`min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all bg-surface ${
              activeFilterCount > 0
                ? "border-secondary/50 text-secondary"
                : "border-border text-muted hover:border-primary/50 hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>
          <SortDropdown value={sort} onChange={setSort} hasLocation={!!coords} className="w-full" />
        </div>
      </div>

      <div ref={resultsRef} className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {query ? `PGs matching "${query}"` : coords ? "PGs Near You" : "Live PG Listings"}
        </h2>
        <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
          {status === "locating" && !coords ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary" />
              Locating you to find nearby PGs...
            </>
          ) : (
            <>
              {coords ? (
                <Navigation className="w-3.5 h-3.5 text-secondary" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-muted" />
              )}
              {listings.length} available listing{listings.length !== 1 ? "s" : ""}
              {filters.verified && " · verified only"}
            </>
          )}
        </p>
      </div>

      {showBanner && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5">
          <div className="shrink-0 mt-0.5">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {status === "denied"
                ? "Location access is turned off"
                : "Location is not available on this device"}
            </p>
            <p className="text-sm text-muted mt-0.5">
              Enter a city or locality in the search bar above to find PGs near you.
              {status === "denied" && " You can also enable GPS/location for this site."}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button
                onClick={requestLocation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all"
              >
                <Navigation className="w-4 h-4" />
                Enable Location
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss location prompt"
            className="shrink-0 p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-surface-alt border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-10 text-center">
          <MapPin className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No PGs found</h3>
          <p className="text-sm text-muted max-w-md mx-auto mb-4">
            We couldn&apos;t find any PGs matching your search or filters. Try adjusting them.
          </p>
          {(activeFilterCount > 0 || query) && (
            <button
              onClick={() => {
                setFilters(emptyFilters);
                setQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Clear search & filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <PGCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Filters modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
            <div className="bg-surface w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-light" />
                  Filters
                </h3>
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                {/* Verified only — prominent */}
                <button
                  onClick={() => setFilters((p) => ({ ...p, verified: !p.verified }))}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all mb-6 ${
                    filters.verified
                      ? "bg-secondary/10 border-secondary/40"
                      : "bg-surface border-border hover:border-secondary/40"
                  }`}
                >
                  <span className="text-left">
                    <span
                      className={`flex items-center gap-1.5 text-sm font-semibold ${
                        filters.verified ? "text-secondary" : "text-foreground"
                      }`}
                    >
                      <BadgeCheck className="w-4 h-4" />
                      Verified PGs Only
                    </span>
                    <span className="block text-xs text-muted mt-0.5">
                      Physically inspected properties
                    </span>
                  </span>
                  <span
                    className={`w-9 h-5 rounded-full relative transition-all shrink-0 ${
                      filters.verified ? "bg-secondary" : "bg-muted/40"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        filters.verified ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>

                {/* Budget */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-2.5">Max Monthly Budget</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {budgetOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() =>
                          setFilters((p) => ({ ...p, budget: p.budget === value ? "" : value }))
                        }
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          filters.budget === value
                            ? "bg-primary text-white border-primary neon-glow"
                            : "bg-surface text-muted border-border hover:text-foreground hover:border-primary/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Sharing */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-2.5">Room Sharing</p>
                  <div className="space-y-1">
                    {sharingOptions.map(({ value, label }) => {
                      const checked = filters.sharing.includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() => toggleArrayFilter("sharing", value)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                            checked
                              ? "bg-primary/10 border-primary/40 text-foreground"
                              : "border-transparent text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              checked ? "bg-primary border-primary" : "border-muted/50"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="text-left">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Food */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-2.5">Meals & Food</p>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, food: !p.food }))}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                      filters.food
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "border-transparent text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        filters.food ? "bg-primary border-primary" : "border-muted/50"
                      }`}
                    >
                      {filters.food && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="text-left">Food Included in Rent</span>
                  </button>
                </div>

                {/* Amenities */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-foreground mb-2.5">Amenities</p>
                  <div className="space-y-1">
                    {amenityOptions.map(({ value, label }) => {
                      const checked = filters.amenities.includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() => toggleArrayFilter("amenities", value)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                            checked
                              ? "bg-primary/10 border-primary/40 text-foreground"
                              : "border-transparent text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              checked ? "bg-primary border-primary" : "border-muted/50"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="text-left">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-surface">
                <button
                  onClick={() => setFilters(emptyFilters)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:border-primary/40 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all"
                >
                  Show {listings.length} result{listings.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}