"use client";

import Link from "next/link";
import { RESET_HOME_EVENT } from "@/lib/searchFocus";
import { EagleIcon } from "@/components/EagleIcon";

interface BrandLogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export function BrandLogo({ size = "sm", className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      onClick={() => window.dispatchEvent(new Event(RESET_HOME_EVENT))}
      aria-label="PGNearMe home"
      title="Go to homepage"
      className={`flex items-center gap-2 transition-opacity hover:opacity-85 ${className}`}
    >
      <div
        className={`${
          size === "lg" ? "w-10 h-10" : "w-9 h-9"
        } rounded-lg bg-neon-blue flex items-center justify-center shrink-0`}
      >
        <EagleIcon
          className={size === "lg" ? "w-6 h-6 text-white" : "w-5 h-5 text-white"}
        />
      </div>
      <span
        className={`${
          size === "lg" ? "text-2xl" : "text-xl"
        } font-bold text-foreground`}
      >
        PG<span className="text-neon-blue">NearMe</span>
      </span>
    </Link>
  );
}