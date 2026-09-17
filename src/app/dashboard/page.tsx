"use client";

import { useEffect, useState, useMemo } from "react";
import { PGCard } from "@/components/PGCard";
import { TypewriterText } from "@/components/TypewriterText";
import { toPGListing } from "@/lib/listings";
import type { PGRecord } from "@/lib/types";
import type { PGListing } from "@/lib/listings";
import { getDistanceKm } from "@/lib/geo";
import { hasAmenity, sharingOptions } from "@/lib/filterOptions";
import {
  Search,
  Navigation,
  Loader2,
  Wifi,
  Snowflake,
  BedSingle,
  BadgePercent,
  Building2,
  Sparkles,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";

const quickTags = [
  {
    id: "single",
    label: "Single Room",
    icon: BedSingle,
    predicate: (l: PGListing) =>
      l.sharing?.some((s) => s.toLowerCase().includes("single")) ||
      l.occupancy.toLowerCase().includes("single"),
  },
  {
    id: "wifi",
    label: "WiFi Included",
    icon: Wifi,
    predicate: (l: PGListing) => hasAmenity(l.amenities, "WiFi"),
  },
  {
    id: "ac",
    label: "AC Rooms",
    icon: Snowflake,
    predicate: (l: PGListing) => hasAmenity(l.amenities, "AC"),
  },
  {
    id: "zero-brokerage",
    label: "Zero Brokerage",
    icon: BadgePercent,
    predicate: () => true,
  },
];

const priceOptions = [
  { value: "", label: "Any Price" },
  { value: "0-5000", label: "Under ₹5,000" },
  { value: "5000-10000", label: "₹5,000 - ₹10,000" },
  { value: "10000-15000", label: "₹10,000 - ₹15,000" },
  { value: "15000-50000", label: "₹15,000 +" },
];

const genderOptions = [
  { value: "", label: "All" },
  { value: "male", label: "Boys" },
  { value: "female", label: "Girls" },
  { value: "unisex", label: "Co-Ed" },
];

const sharingKeywords: Record<string, string[]> = {
  single: ["single", "private"],
  double: ["double", "2 sharing", "twin"],
  triple: ["triple", "3 sharing"],
  quad: ["4 sharing", "dorm", "quad"],
};

function matchesSharing(l: PGListing, value: string): boolean {
  if (l.sharing?.some((s) => s.toLowerCase().includes(value))) return true;
  const kw = sharingKeywords[value] ?? [value];
  return kw.some((k) => l.occupancy.toLowerCase().includes(k));
}

const popularAreas = [
  "HSR Layout",
  "Koramangala",
  "Electronic City",
  "Whitefield",
  "Hinjewadi",
  "Gachibowli",
];

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="h-48 bg-surface-alt" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-surface-alt" />
        <div className="h-3 w-1/2 rounded bg-surface-alt" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded bg-surface-alt" />
          <div className="h-6 w-20 rounded bg-surface-alt" />
        </div>
        <div className="h-5 w-1/3 rounded bg-surface-alt" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [records, setRecords] = useState<PGRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sharing, setSharing] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ status: "approved" });
    fetch(`/api/pg?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setRecords(d.listings || []);
        setLoading(false);
      })
      .catch(() => {
        setRecords([]);
        setLoading(false);
      });
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === 1
            ? "Location permission denied. Allow access to see PGs near you."
            : "Could not get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      requestLocation();
    }, 300);
    return () => window.clearTimeout(id);
  }, []);

  const listings = useMemo(
    () =>
      records.map((r) => ({
        ...toPGListing(r),
        distance: getDistanceKm(location?.lat, location?.lng, r.lat, r.lng),
      })),
    [records, location]
  );

  const filtered = useMemo(() => {
    let f = listings;
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      f = f.filter(
        (l) =>
          l.name.toLowerCase().includes(t) ||
          l.locality.toLowerCase().includes(t) ||
          l.city.toLowerCase().includes(t)
      );
    }
    if (gender) f = f.filter((l) => l.gender === gender);
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      f = f.filter((l) => l.priceMin >= min && l.priceMax <= max);
    }
    if (sharing.length > 0) {
      f = f.filter((l) => sharing.some((s) => matchesSharing(l, s)));
    }
    if (tags.length > 0) {
      f = f.filter((l) =>
        tags.every((tag) => quickTags.find((t) => t.id === tag)?.predicate(l))
      );
    }
    return f;
  }, [listings, q, gender, priceRange, sharing, tags]);

  const hasFilters = q.trim() !== "" || gender !== "" || priceRange !== "" || sharing.length > 0 || tags.length > 0;

  const clearFilters = () => {
    setQ("");
    setGender("");
    setPriceRange("");
    setSharing([]);
    setTags([]);
    setVisibleCount(6);
  };

  const toggleMulti = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev) => {
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      setVisibleCount(6);
      return next;
    });
  };

  const firstName = "User";

  return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                Hi {firstName},{" "}
                <TypewriterText
                  texts={["Verified", "Zero Commission", "Direct Contact"]}
                  speed={70}
                  deleteSpeed={35}
                  pause={1800}
                />
              </h1>
              <p className="text-sm text-muted mt-1 max-w-lg">
                India&apos;s most trusted platform for finding PG, hostel, and paying
                guest accommodations. Direct owner contact, verified listings.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:gap-10">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setVisibleCount(6);
                    }}
                    placeholder="Search by locality, landmark or PG name..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-surface text-foreground text-sm search-input focus:border-primary shadow-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-xs text-muted mr-1">Popular:</span>
                  {popularAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        setQ(area);
                        setVisibleCount(6);
                      }}
                      className="text-xs font-medium text-primary-light bg-primary/10 border border-primary/15 hover:border-primary/40 px-2.5 py-1 rounded-full transition-all"
                    >
                      {area}
                    </button>
                  ))}
                  <button
                    onClick={requestLocation}
                    disabled={locating}
                    title={
                      location
                        ? "You're viewing PGs near your current location. Tap to update."
                        : "Find PGs near you"
                    }
                    className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-foreground hover:border-secondary/60 hover:text-secondary transition-all disabled:opacity-50"
                  >
                    {locating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-secondary" />
                    )}
                  </button>
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-surface text-foreground hover:border-primary/50 hover:text-primary-light transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                    {hasFilters && (
                      <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                        {sharing.length + (gender ? 1 : 0) + (priceRange ? 1 : 0) + (tags.length + (q.trim() ? 1 : 0))}
                      </span>
                    )}
                  </button>
                </div>
                {locationError && (
                  <p className="text-xs text-red-400 mt-2">{locationError}</p>
                )}
              </div>

              {/* Quick tags — Popular searches & highlights */}
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Popular Filters:
                </span>
                {quickTags.map(({ id, label, icon: Icon }) => {
                  const active = tags.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setTags((prev) => {
                          const next = prev.includes(id)
                            ? prev.filter((t) => t !== id)
                            : [...prev, id];
                          setVisibleCount(6);
                          return next;
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? "bg-accent text-white border-accent neon-glow-pink"
                          : "bg-surface text-muted border-border hover:text-foreground hover:border-accent/50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-accent"}`} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* All Listed PGs */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-light" />
                    All Listed PGs
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {loading
                      ? "Loading active listings..."
                      : `${filtered.length} active PG${filtered.length !== 1 ? "s" : ""} available`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : filtered.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.slice(0, visibleCount).map((listing) => (
                    <PGCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 bg-surface rounded-xl border border-border p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-alt border border-border flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-primary/40" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No PGs Found</h3>
                  <p className="text-sm text-muted max-w-sm mx-auto mb-4">
                    No active PG matches your current filters. Try clearing some filters or search a different area.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all neon-glow"
                  >
                    <Plus className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}

              {!loading && filtered.length > visibleCount && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-surface text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary-light transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Show {Math.min(6, filtered.length - visibleCount)} more
                  </button>
                </div>
              )}

              {/* Filters drawer */}
              {filtersOpen && (
                <div className="fixed inset-0 z-50">
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setFiltersOpen(false)}
                  />
                  <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-border overflow-y-auto">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
                      <span className="font-semibold text-foreground">Filters</span>
                      <button
                        onClick={() => setFiltersOpen(false)}
                        className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-muted hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-xs text-muted">
                          Applied: {hasFilters ? "active" : "none"}
                        </p>
                        {hasFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-accent hover:opacity-80 transition-all"
                          >
                            Reset All
                          </button>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="mb-6">
                        <p className="text-sm font-medium text-foreground mb-2.5">Gender Preference</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {genderOptions.map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => {
                                setGender(value);
                                setVisibleCount(6);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                gender === value
                                  ? "bg-primary text-white border-primary neon-glow"
                                  : "bg-surface text-muted border-border hover:text-foreground hover:border-primary/40"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <p className="text-sm font-medium text-foreground mb-2.5">Monthly Price</p>
                        <div className="space-y-1">
                          {priceOptions.map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => {
                                setPriceRange(value);
                                setVisibleCount(6);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-sm border transition-all ${
                                priceRange === value
                                  ? "bg-primary/10 border-primary/40 text-foreground"
                                  : "border-transparent text-muted hover:text-foreground hover:bg-surface-alt"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sharing */}
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2.5">Room Sharing</p>
                        <div className="space-y-1">
                          {sharingOptions.map(({ value, label }) => {
                            const checked = sharing.includes(value);
                            return (
                              <button
                                key={value}
                                onClick={() => toggleMulti(setSharing, value)}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm border transition-all ${
                                  checked
                                    ? "bg-primary/10 border-primary/40 text-foreground"
                                    : "border-transparent text-muted hover:text-foreground hover:bg-surface-alt"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => setFiltersOpen(false)}
                        className={`mt-6 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                          hasFilters
                            ? "bg-accent text-white hover:bg-accent-light"
                            : "bg-primary text-white hover:bg-primary-light neon-glow"
                        }`}
                      >
                        {hasFilters ? "Show Results" : "Done"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}