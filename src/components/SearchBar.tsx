"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Navigation, Loader2, Clock, X } from "lucide-react";
import {
  FOCUS_SEARCH_EVENT,
  FOCUS_PENDING_KEY,
} from "@/lib/searchFocus";

const RECENT_KEY = "pgnearme_recent_searches";

export function SearchBar({
  onSearch,
  showNearMe = true,
  className = "",
}: {
  onSearch?: (opts: { city: string; lat?: number; lng?: number }) => void;
  showNearMe?: boolean;
  className?: string;
} = {}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(String).filter(Boolean).slice(0, 5);
        }
      }
    } catch {
      /* storage unavailable */
    }
    return [];
  });

  useEffect(() => {
    const focusInput = () => {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus({ preventScroll: true });
    };
    const handler = () => focusInput();
    window.addEventListener(FOCUS_SEARCH_EVENT, handler);

    let pending = false;
    try {
      pending = sessionStorage.getItem(FOCUS_PENDING_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    if (pending) {
      try {
        sessionStorage.removeItem(FOCUS_PENDING_KEY);
      } catch {
        /* storage unavailable */
      }
      const raf = requestAnimationFrame(focusInput);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener(FOCUS_SEARCH_EVENT, handler);
      };
    }

    return () => window.removeEventListener(FOCUS_SEARCH_EVENT, handler);
  }, []);

  const saveRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5);
    setRecents(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const handleSearch = (lat?: number, lng?: number, cityOverride?: string) => {
    const finalCity = cityOverride !== undefined ? cityOverride : city;
    const finalLat = lat !== undefined ? lat : locationCoords?.lat;
    const finalLng = lng !== undefined ? lng : locationCoords?.lng;
    saveRecent(finalCity);

    if (onSearch) {
      onSearch({ city: finalCity, lat: finalLat, lng: finalLng });
      return;
    }

    const params = new URLSearchParams();
    if (finalCity) params.set("city", finalCity);
    if (finalLat !== undefined && finalLng !== undefined) {
      params.set("lat", String(finalLat));
      params.set("lng", String(finalLng));
    }
    router.push(`/search?${params.toString()}`);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        setLocating(false);
        setFocused(false);
        handleSearch(latitude, longitude);
      },
      (err) => {
        setLocating(false);
        alert(
          err.code === 1
            ? "Location permission denied. Please allow location access and try again."
            : "Could not get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  const pickRecent = (term: string) => {
    setCity(term);
    setFocused(false);
    handleSearch(undefined, undefined, term);
  };

  const showDropdown = focused;

  return (
    <div
      ref={rootRef}
      data-search-bar
      className={`relative flex items-center gap-2 w-full max-w-2xl ${className}`}
    >
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
        <input
          ref={inputRef}
          type="text"
          placeholder="City or locality..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          aria-label="Search by city or locality"
          aria-expanded={showDropdown}
          aria-controls="pgnearme-search-options"
          role="combobox"
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm search-input focus:border-primary"
        />

        {city && (
          <button
            type="button"
            onClick={() => setCity("")}
            aria-label="Clear search text"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-surface-alt text-muted hover:text-foreground hover:bg-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {showDropdown && (
          <div
            id="pgnearme-search-options"
            className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden"
          >
            <p className="px-4 py-2 text-xs font-medium text-muted uppercase border-b border-border">
              Current location
            </p>
            <ul className="py-1 max-h-64 overflow-y-auto">
              <li>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-surface-alt hover:text-foreground transition-colors text-muted"
                >
                  <Navigation className="w-4 h-4 shrink-0 text-secondary" />
                  Use my current location
                  {locating && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                </button>
              </li>
            </ul>
            {recents.length > 0 && (
              <>
                <p className="px-4 py-2 text-xs font-medium text-muted uppercase border-y border-border">
                  Recent searches
                </p>
                <ul className="py-1 max-h-64 overflow-y-auto">
                  {recents.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => pickRecent(term)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-surface-alt hover:text-foreground transition-colors text-muted"
                      >
                        <Clock className="w-4 h-4 shrink-0 text-secondary" />
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
      <button
        onClick={() => handleSearch()}
        aria-label="Search"
        className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all shrink-0"
      >
        <Search className="w-4 h-4" />
      </button>
      {showNearMe && (
        <button
          onClick={useMyLocation}
          disabled={locating}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all shrink-0 ${
            locationCoords
              ? "bg-secondary/10 text-secondary border-secondary/30"
              : "bg-surface text-muted border-border hover:text-foreground hover:border-secondary/40"
          } disabled:opacity-50`}
        >
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {locating ? "Locating..." : "Near Me"}
        </button>
      )}
    </div>
  );
}