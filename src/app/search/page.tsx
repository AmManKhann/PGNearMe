"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { PGCard } from "@/components/PGCard";
import { SortDropdown, type SortValue } from "@/components/SortDropdown";
import { toPGListing, type PGListing } from "@/lib/listings";
import type { PGRecord } from "@/lib/types";
import { ArrowUpDown, Loader2, Navigation } from "lucide-react";

const PAGE_SIZE = 12;

type FeedRecord = PGRecord & { distanceKm?: number | null };

interface FeedData {
  listings: FeedRecord[];
  total: number;
  page: number;
  hasMore: boolean;
  clientLocation?: { lat?: number; lng?: number };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const city = searchParams.get("city") ?? "";
  const sortParam = searchParams.get("sort") as SortValue | null;
  const sort: SortValue = sortParam ?? "nearest";
  const userLat = parseFloat(searchParams.get("lat") ?? "");
  const userLng = parseFloat(searchParams.get("lng") ?? "");
  const hasLocation = !isNaN(userLat) && !isNaN(userLng);

  const [records, setRecords] = useState<FeedRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fallback, setFallback] = useState<PGListing[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);

  const paramsStr = searchParams.toString();

  const buildParams = useCallback(
    (pageNum: number) => {
      const p = new URLSearchParams(paramsStr);
      p.set("status", "approved");
      p.set("page", String(pageNum));
      p.set("limit", String(PAGE_SIZE));
      if (!p.has("sort")) p.set("sort", "nearest");
      const lat = p.get("lat");
      const lng = p.get("lng");
      if (lat === null || isNaN(Number(lat))) p.delete("lat");
      if (lng === null || isNaN(Number(lng))) p.delete("lng");
      const budget = p.get("budget");
      if (budget) p.set("priceMax", budget);
      return p;
    },
    [paramsStr]
  );

  const loadNearestFallback = useCallback(async () => {
    try {
      const p = new URLSearchParams({
        status: "approved",
        sort: "nearest",
        page: "1",
        limit: "4",
      });
      if (hasLocation) {
        p.set("lat", String(userLat));
        p.set("lng", String(userLng));
      }
      const res = await fetch(`/api/pg?${p.toString()}`);
      const d: FeedData = await res.json();
      setFallback((d.listings || []).map((r) => toPGListing(r, r.distanceKm)));
    } catch {
      setFallback([]);
    }
  }, [hasLocation, userLat, userLng]);

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
        if ((d.total || 0) === 0) await loadNearestFallback();
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
  }, [buildParams, loadNearestFallback]);

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

  const updateSort = (value: SortValue) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "boys") {
      sp.set("gender", "male");
      sp.set("sort", "nearest");
    } else if (value === "girls") {
      sp.set("gender", "female");
      sp.set("sort", "nearest");
    } else if (value === "coed") {
      sp.set("gender", "unisex");
      sp.set("sort", "nearest");
    } else {
      sp.set("sort", value);
    }
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
              {total} listing{total !== 1 ? "s" : ""} found
              {hasLocation && (
                <span className="ml-2 inline-flex items-center gap-1 text-secondary font-medium">
                  <Navigation className="w-3 h-3" />
                  sorted by nearest
                </span>
              )}
            </p>
          </div>
          <SortDropdown value={sort} onChange={updateSort} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="lg:w-72 shrink-0">
            <Suspense fallback={null}>
              <SearchFilters />
            </Suspense>
          </div>

          {loading ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-surface-alt border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : records.length > 0 ? (
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {records.map((r) => (
                  <PGCard key={r.id} listing={toPGListing(r, r.distanceKm ?? null)} />
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
          ) : (
            <div className="flex-1">
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 animate-float">
                  <ArrowUpDown className="w-8 h-8 text-primary/50" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No exact matches found</h2>
                <p className="text-muted max-w-md mx-auto">
                  Showing the nearest PGs instead:
                </p>
              </div>
              {fallback.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {fallback.map((listing) => (
                    <PGCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
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