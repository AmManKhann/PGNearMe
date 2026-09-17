"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, Navigation, Star, Clock, X } from "lucide-react";

export type SortValue = "nearest" | "price-asc" | "price-desc" | "rating" | "newest";

export const SORT_LABELS: Record<SortValue, string> = {
  nearest: "Nearest First",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Highest Rated",
  newest: "Newest Listings First",
};

const options: { value: SortValue; icon: typeof Star; needsLocation?: boolean }[] = [
  { value: "nearest", icon: Navigation, needsLocation: true },
  { value: "price-asc", icon: ArrowUpDown },
  { value: "price-desc", icon: ArrowUpDown },
  { value: "rating", icon: Star },
  { value: "newest", icon: Clock },
];

export function SortDropdown({
  value,
  onChange,
  hasLocation = false,
  className = "",
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
  hasLocation?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const select = (optValue: SortValue) => {
    onChange(optValue);
    setOpen(false);
  };

  const optionsList = (
    <ul role="listbox" className="py-1">
      {options.map(({ value: optValue, icon: Icon, needsLocation }) => {
        const disabled = needsLocation && !hasLocation;
        const selected = value === optValue;
        return (
          <li key={optValue}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              disabled={disabled}
              onClick={() => select(optValue)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                disabled
                  ? "text-muted/50 cursor-not-allowed"
                  : selected
                  ? "bg-primary/10 text-foreground font-semibold"
                  : "text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{SORT_LABELS[optValue]}</span>
              {selected && !disabled && <Check className="w-4 h-4 text-secondary" />}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all bg-surface ${
          open
            ? "border-primary/50 text-foreground"
            : "border-border text-muted hover:border-primary/50 hover:text-foreground"
        }`}
      >
        <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="truncate">Sort By</span>
        <span className="hidden sm:inline text-foreground font-semibold">
          &middot; {SORT_LABELS[value]}
        </span>
      </button>

      {/* Desktop dropdown — aligned to button right edge, above card content */}
      {open && (
        <div className="hidden sm:block">
          <div className="absolute right-0 z-50 mt-2 w-60 bg-surface border border-border rounded-xl shadow-xl origin-top-right overflow-hidden">
            <p className="px-4 py-2 text-xs font-medium text-muted uppercase border-b border-border">
              Sort listings by
            </p>
            {optionsList}
          </div>
        </div>
      )}

      {/* Mobile bottom sheet — centered full-width sheet, never clipped off-screen */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-surface rounded-t-2xl border-t border-border p-5 pb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted uppercase">
                Sort listings by
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close sort menu"
                className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {optionsList}
          </div>
        </div>
      )}
    </div>
  );
}