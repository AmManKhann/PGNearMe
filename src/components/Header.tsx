"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { FindPGAction } from "@/components/FindPGAction";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <ThemeToggle />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <FindPGAction />
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/owner"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--btn)] text-[var(--btn-text)] text-sm font-semibold hover:bg-[var(--btn-hover)] transition-all neon-glow"
            >
              <Building2 className="w-4 h-4" />
              List Your PG
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-3 space-y-1">
            <div onClick={() => setMobileOpen(false)}>
              <FindPGAction variant="mobile" />
            </div>
            <Link
              href="/owner"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-[var(--btn)] text-[var(--btn-text)] transition-all"
            >
              <Building2 className="w-4 h-4" />
              List Your PG
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}