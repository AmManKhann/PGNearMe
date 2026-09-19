"use client";

import Link from "next/link";
import Image from "next/image";
import { RESET_HOME_EVENT } from "@/lib/searchFocus";

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
        } rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0`}
      >
        <Image
          src="/icon.png"
          alt="PG Near Me eagle logo"
          width={350}
          height={350}
          className="w-full h-full object-contain"
          unoptimized
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