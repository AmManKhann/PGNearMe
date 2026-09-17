"use client";

import { MapPin } from "lucide-react";
import { CITY_SELECT_EVENT } from "@/lib/searchFocus";

export function CityPills({ cities }: { cities: string[] }) {
  const choose = (city: string) => {
    try {
      window.dispatchEvent(
        new CustomEvent(CITY_SELECT_EVENT, { detail: city })
      );
    } catch {
      /* event unsupported */
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {cities.map((city) => (
        <button
          key={city}
          type="button"
          onClick={() => choose(city)}
          aria-label={`Show PG listings in ${city}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/30 text-sm font-medium hover:bg-accent/20 hover:border-accent/50 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-all active:scale-95 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          PG in {city}
        </button>
      ))}
    </div>
  );
}