"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useEngagement, useClientReady } from "@/lib/engagement";

export function LikeButton({
  entityId,
  seedCount = 0,
  variant = "overlay",
  size = "md",
}: {
  entityId: string | number;
  seedCount?: number;
  variant?: "overlay" | "inline";
  size?: "sm" | "md";
}) {
  const { isLiked, likeCount, toggleLike, hydrateListing } = useEngagement();
  const clientReady = useClientReady();
  const key = String(entityId);
  const liked = isLiked(key);
  const count = likeCount(key, seedCount);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  useEffect(() => {
    if (clientReady) hydrateListing(key);
  }, [clientReady, key, hydrateListing]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(key);
      }}
      aria-label={liked ? "Unlike this listing" : "Like this listing"}
      title={liked ? "Unlike" : "Like"}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all select-none ${
        size === "sm" ? "text-xs px-2.5 py-1.5" : "text-sm px-3.5 py-2"
      } ${
        variant === "overlay"
          ? "bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/70"
          : "bg-surface border border-border text-foreground hover:border-accent/50"
      } ${liked ? (variant === "overlay" ? "neon-glow-pink" : "border-accent/60") : ""}`}
    >
      <Heart
        className={`${iconSize} transition-all ${
          liked ? "fill-accent text-accent animate-[heart-pop_0.3s_ease]" : "text-inherit"
        }`}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}