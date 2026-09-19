"use client";

import Link from "next/link";
import { Home, Building2 } from "lucide-react";
import { RESET_HOME_EVENT } from "@/lib/searchFocus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { FindPGAction } from "@/components/FindPGAction";

export function Header() {
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

          <Link
            href="/"
            onClick={() => window.dispatchEvent(new Event(RESET_HOME_EVENT))}
            className="md:hidden flex items-center gap-1.5 p-2 rounded-lg hover:bg-surface transition-colors text-foreground"
            aria-label="Go home"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}