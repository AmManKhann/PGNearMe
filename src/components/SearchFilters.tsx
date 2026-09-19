"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  X,
  BadgeCheck,
} from "lucide-react";
import {
  budgetOptions,
  sharingOptions,
  amenityOptions,
  genderOptions,
} from "@/lib/filterOptions";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const budget = searchParams.get("budget") ?? "";
  const [budgetDraft, setBudgetDraft] = useState(budget);
  const sharing = (searchParams.get("sharing") ?? "").split(",").filter(Boolean);
  const gender = searchParams.get("gender") ?? "";
  const amenities = (searchParams.get("amenities") ?? "").split(",").filter(Boolean);
  const food = searchParams.get("food") === "1";
  const verified = searchParams.get("verified") === "1";

  const activeCount =
    (budget ? 1 : 0) + sharing.length + amenities.length + (food ? 1 : 0) + (verified ? 1 : 0) + (gender ? 1 : 0);

  const push = (sp: URLSearchParams) => {
    router.replace(`/search?${sp.toString()}`, { scroll: false });
  };

  const toggleMulti = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    const current = (sp.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length === 0) sp.delete(key);
    else sp.set(key, next.join(","));
    push(sp);
  };

  const toggleSingle = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    push(sp);
  };

  const toggleFlag = (key: string, on: boolean) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (on) sp.set(key, "1");
    else sp.delete(key);
    push(sp);
  };

  const commitBudget = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const numeric = parseInt(digits, 10);
    const next = digits && numeric > 0 ? String(numeric) : "";
    setBudgetDraft(next);
    toggleSingle("budget", next);
  };

  const selectBudgetChip = (value: string) => {
    const next = budget === value ? "" : value;
    setBudgetDraft(next);
    toggleSingle("budget", next);
  };

  const resetAll = () => {
    const sp = new URLSearchParams(searchParams.toString());
    ["budget", "sharing", "amenities", "food", "verified", "gender"].forEach((k) => sp.delete(k));
    push(sp);
  };

  const panel = (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-light" />
          Filters
        </h3>
        <button
          onClick={resetAll}
          className={`flex items-center gap-1 text-xs font-medium transition-all ${
            activeCount > 0
              ? "text-accent hover:opacity-80"
              : "text-muted hover:text-foreground"
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Max Monthly Budget */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-medium text-foreground">Max Monthly Budget</p>
          {budgetDraft && (
            <span className="text-xs font-semibold text-secondary">
              ₹{Number(budgetDraft).toLocaleString("en-IN")}/mo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary font-semibold">
              ₹
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              onBlur={(e) => commitBudget(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              placeholder="Any amount"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm placeholder-muted focus:outline-none focus:border-primary tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {budgetOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => selectBudgetChip(value)}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                budget === value
                  ? "bg-primary text-white border-primary neon-glow"
                  : "bg-surface text-muted border-border hover:text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* PG Type / Gender */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-2.5">PG Type / Gender</p>
        <div className="space-y-1">
          {genderOptions.map(({ value, label }) => {
            const checked = gender === value;
            return (
              <button
                key={value}
                onClick={() => toggleSingle("gender", checked ? "" : value)}
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

      {/* Room Sharing */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-2.5">Room Sharing</p>
        <div className="space-y-1">
          {sharingOptions.map(({ value, label }) => {
            const checked = sharing.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleMulti("sharing", value)}
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

      {/* Meals & Food */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-2.5">Meals & Food</p>
        <button
          onClick={() => toggleFlag("food", !food)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
            food ? "bg-primary/10 border-primary/40 text-foreground" : "border-transparent text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                food ? "bg-primary border-primary" : "border-muted/50"
              }`}
            >
              {food && <Check className="w-3 h-3 text-white" />}
            </span>
            Food Included in Rent
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              food ? "bg-secondary/10 text-secondary border-secondary/30" : "bg-surface text-muted border-border"
            }`}
          >
            {food ? "Included" : "Optional"}
          </span>
        </button>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-2.5">Amenities</p>
        <div className="space-y-1">
          {amenityOptions.map(({ value, label }) => {
            const checked = amenities.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleMulti("amenities", value)}
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

      {/* Verified only */}
      <button
        onClick={() => toggleFlag("verified", !verified)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
          verified
            ? "bg-secondary/10 border-secondary/40"
            : "bg-surface border-border hover:border-secondary/40"
        }`}
      >
        <span className="text-left">
          <span className={`flex items-center gap-1.5 text-sm font-semibold ${verified ? "text-secondary" : "text-foreground"}`}>
            <BadgeCheck className="w-4 h-4" />
            Verified PGs Only
          </span>
          <span className="block text-xs text-muted mt-0.5">Physically inspected properties</span>
        </span>
        <span
          className={`w-9 h-5 rounded-full relative transition-all shrink-0 ${
            verified ? "bg-secondary" : "bg-muted/40"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              verified ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
      </button>

      {activeCount > 0 && (
        <button
          onClick={resetAll}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Clear {activeCount} active filter{activeCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-muted hover:border-primary/50 hover:text-foreground transition-all bg-surface"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-surface border-r border-border overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-foreground">Filters</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block bg-surface border border-border/60 rounded-2xl overflow-hidden sticky top-24">
        {panel}
      </aside>
    </>
  );
}