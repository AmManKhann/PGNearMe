"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  focusSearch,
  markSearchFocusPending,
  SEARCH_PAGES,
} from "@/lib/searchFocus";

export function FindPGAction({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile" | "link";
}) {
  const pathname = usePathname();
  const router = useRouter();

  const active = pathname === "/" || pathname.startsWith("/search");

  const handleClick = () => {
    if (SEARCH_PAGES.has(pathname)) {
      focusSearch();
    } else {
      markSearchFocusPending();
      router.push("/");
    }
  };

  const base =
    variant === "link"
      ? "inline-flex items-center gap-1.5 text-muted hover:text-primary-light transition-colors"
      : variant === "mobile"
      ? `w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          active
            ? "bg-primary/10 text-primary-light"
            : "text-muted hover:text-foreground hover:bg-surface-alt"
        }`
      : `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          active
            ? "bg-primary/10 text-primary-light"
            : "text-muted hover:text-foreground hover:bg-surface-alt"
        }`;

  return (
    <button type="button" onClick={handleClick} className={base}>
      <Search className="w-4 h-4" />
      Find PG
    </button>
  );
}