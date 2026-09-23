"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CITY_SELECT_EVENT, RESET_HOME_EVENT } from "@/lib/searchFocus";
import { budgetOptions, sharingOptions, amenityOptions, genderOptions } from "@/lib/filterOptions";

type LocationStatus = "locating" | "granted" | "denied" | "idle";

interface Filters {
  verified: boolean;
  budget: string;
  sharing: string[];
  food: boolean;
  amenities: string[];
  gender: string;
}

const emptyFilters: Filters = {
  verified: false,
  budget: "",
  sharing: [],
  food: false,
  amenities: [],
  gender: "",
};

const geolocationSupported =
  typeof navigator !== "undefined" && "geolocation" in navigator;

const PAGE_SIZE = 12;

type FeedRecord = PGRecord & { distanceKm?: number | null };

interface FeedData {
  listings: FeedRecord[];
  total: number;
  page: number;
  hasMore: boolean;
  clientLocation?: { lat?: number; lng?: number };
}

export function LivePGFeed() {
  const [records, setRecords] = useState<FeedRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<LocationStatus>("locating");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("nearest");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fallback, setFallback] = useState<PGListing[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);

  const buildParams = useCallback(
    (pageNum: number) => {
      const p = new URLSearchParams({
        status: "approved",
        sort,
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (coords) {
        p.set("lat", String(coords.lat));
        p.set("lng", String(coords.lng));
      }
      const q = query.trim();
      if (q) p.set("q", q);
      if (filters.verified) p.set("verified", "1");
      if (filters.budget) p.set("priceMax", filters.budget);
      if (filters.gender) p.set("gender", filters.gender);
      if (filters.sharing.length > 0) p.set("sharing", filters.sharing.join(","));
      if (filters.food) p.set("food", "1");
      if (filters.amenities.length > 0) p.set("amenities", filters.amenities.join(","));
      return p;
    },
    [coords, query, sort, filters]
  );

  const loadFallback = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: "approved",
        sort: "nearest",
        page: "1",
        limit: "4",
      });
      if (coords) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
      }
      const res = await fetch(`/api/pg?${params.toString()}`);
      const d: FeedData = await res.json();
      setFallback((d.listings || []).map((r) => toPGListing(r, r.distanceKm)));
    } catch {
      setFallback([]);
    }
  }, [coords]);

  useEffect(() => {
    const id = ++requestIdRef.current;
    pageRef.current = 1;
    fetch(`/api/pg?${buildParams(1).toString()}`)
      .then((r) => r.json())
      .then(async (d: FeedData) => {
        if (requestIdRef.current !== id) return;
        setRecords(d.listings || []);
        setTotal(d.total || 0);
        setHasMore(!!d.hasMore);
        setFallback([]);
        const cl = d.clientLocation;
        if (!coords && cl && typeof cl.lat === "number" && typeof cl.lng === "number") {
          setCoords({ lat: cl.lat, lng: cl.lng });
        }
        if ((d.total || 0) === 0) await loadFallback();
      })
      .catch(() => {
        if (requestIdRef.current === id) {
          setRecords([]);
          setTotal(0);
          setHasMore(false);
          setFallback([]);
        }
      })
      .finally(() => {
        if (requestIdRef.current === id) setLoading(false);
      });
  }, [buildParams, coords, loadFallback]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const id = requestIdRef.current;
    const nextPage = pageRef.current + 1;
    try {
      const res = await fetch(`/api/pg?${buildParams(nextPage).toString()}`);
      const d: FeedData = await res.json();
      if (requestIdRef.current !== id) return;
      pageRef.current = nextPage;
      setRecords((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...(d.listings || []).filter((x) => !seen.has(x.id))];
      });
      setHasMore(!!d.hasMore);
    } catch {
      // transient load-more failure: retry on next scroll
    } finally {
      loadingMoreRef.current = false;
      if (requestIdRef.current === id) setLoadingMore(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: "800px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    if (!geolocationSupported) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
        setBannerDismissed(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    const onResetHome = () => {
      setQuery("");
      setFilters(emptyFilters);
      setSort("nearest");
      setFiltersOpen(false);
      setBannerDismissed(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener(RESET_HOME_EVENT, onResetHome);
    return () => window.removeEventListener(RESET_HOME_EVENT, onResetHome);
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

  const activeFilterCount =
    (filters.verified ? 1 : 0) +
    (filters.budget ? 1 : 0) +
    filters.sharing.length +
    (filters.food ? 1 : 0) +
    filters.amenities.length +
    (filters.gender ? 1 : 0);

  const listings = useMemo<PGListing[]>(
    () => records.map((r) => toPGListing(r, r.distanceKm ?? null)),
    [records]
  );

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
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const showBanner =
    !coords && (status === "denied" || !geolocationSupported) && !bannerDismissed;

  const requestLocation = () => {
    setBannerDismissed(false);
    if (!geolocationSupported) {
      alert("Location permission denied. Please allow location access and try again.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
        setSort("nearest");
      },
      (err) => {
        setStatus("denied");
        if (err.code === 1) {
          alert("Location permission denied. Please allow location access and try again.");
        } else if (err.code === 2) {
          alert("GPS is turned off. Please turn on your device GPS and try again.");
        } else {
          alert("Location request timed out. Please turn on your device GPS and try again.");
        }
      },
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

  const handleSortChange = (value: SortValue) => {
    if (value === "boys") setFilters((p) => ({ ...p, gender: "male" }));
    else if (value === "girls") setFilters((p) => ({ ...p, gender: "female" }));
    else if (value === "coed") setFilters((p) => ({ ...p, gender: "unisex" }));
    setSort(value);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-x-hidden">
      {/* Search + sort + filter controls */}
      <div className="mb-8">
        <div className="min-w-0">
          <SearchBar
            onSearch={handleSearch}
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
          <SortDropdown value={sort} onChange={handleSortChange} className="w-full" />
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
              {total} available listing{total !== 1 ? "s" : ""}
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
        <div>
          <div className="bg-surface rounded-xl border border-border p-8 text-center mb-6">
            <MapPin className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No exact matches found</h3>
            <p className="text-sm text-muted max-w-md mx-auto mb-4">
              {query
                ? `No PGs matched "${query}". Showing the nearest PGs instead:`
                : "No PGs matched your filters. Showing the nearest PGs instead:"}
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
          {fallback.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fallback.map((listing) => (
                <PGCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <PGCard key={listing.id} listing={listing} />
            ))}
          </div>
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin text-secondary" />
              Loading more listings...
            </div>
          )}
          <div ref={sentinelRef} className="h-px" />
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

                {/* Gender */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-2.5">PG Type / Gender</p>
                  <div className="space-y-1">
                    {genderOptions.map(({ value, label }) => {
                      const checked = filters.gender === value;
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            setFilters((p) => ({ ...p, gender: checked ? "" : value }))
                          }
                          className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                            checked
                              ? "bg-primary/10 border-primary/40 text-foreground"
                              : "border-transparent text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                checked ? "border-primary" : "border-muted/50"
                              }`}
                            >
                              {checked && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </span>
                            <span className="text-left">{label}</span>
                          </span>
                          {checked && <Check className="w-4 h-4 text-secondary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                  Show {total} result{total !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}