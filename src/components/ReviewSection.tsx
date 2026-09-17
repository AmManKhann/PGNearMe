"use client";

import { useState } from "react";
import { Star, PenLine, Tag } from "lucide-react";
import { useEngagement, useClientReady, type ReviewItem } from "@/lib/engagement";

export const REVIEW_TAGS = [
  "Best PG with cleanliness",
  "Affordable & Value for Money",
  "Great Food Quality",
  "Safe & Secure Environment",
  "Friendly Owner & Staff",
  "Excellent Location & Connectivity",
  "High-Speed Wi-Fi",
  "Spacious & Well-Ventilated Rooms",
  "24/7 Power Backup & Water Supply",
  "Quiet & Study-Friendly Environment",
] as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Very Good",
};

function StarRating({
  value,
  onChange,
  size = "w-7 h-7",
}: {
  value: number;
  onChange: (n: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`${size} transition-colors ${
              n <= active ? "text-accent fill-accent" : "text-muted/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({
  entityId,
  seedReviews = [],
  title = "Reviews",
}: {
  entityId: string | number;
  seedReviews?: ReviewItem[];
  title?: string;
}) {
  const key = String(entityId);
  const clientReady = useClientReady();
  const { addReview, getStoredReviews } = useEngagement();
  const stored = getStoredReviews(key);
  const all = [...stored, ...seedReviews];
  const avg = all.length > 0 ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [starTouched, setStarTouched] = useState(false);

  const canSubmit = rating > 0 && tags.length > 0;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!clientReady || !canSubmit) return;
    addReview(key, {
      id: `review-${Date.now()}`,
      author: "Guest",
      rating,
      date: "Just now",
      tags,
    });
    setRating(0);
    setTags([]);
    setStarTouched(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  };

  return (
    <section className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-lg">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="font-bold text-foreground">{avg > 0 ? avg.toFixed(1) : "–"}</span>
          <span className="text-sm text-muted">({all.length})</span>
        </div>
      </div>

      {justAdded && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-secondary/10 border border-secondary/30 text-sm text-secondary font-medium">
          Thanks for your rating!
        </div>
      )}

      <div className="mb-6 p-4 rounded-lg bg-surface-alt border border-border">
        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <PenLine className="w-4 h-4 text-primary-light" />
          Rate this place
        </p>
        <div className={`mb-3 ${starTouched && rating === 0 ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating value={rating} onChange={(n) => { setRating(n); setStarTouched(true); }} />
            <span className="text-sm font-medium text-foreground">
              {rating > 0 ? RATING_LABELS[rating] : "Tap to rate"}
            </span>
          </div>
        </div>

        <p className="text-xs font-medium text-muted mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          What did you like? (select at least one)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {REVIEW_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                tags.includes(tag)
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-muted border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted">
            {rating === 0 ? "Select a star rating" : `${RATING_LABELS[rating]} — ${tags.length} tag${tags.length === 1 ? "" : "s"}`}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Submit Rating
          </button>
        </div>
      </div>

      {all.length > 0 ? (
        <div className="space-y-4">
          {all.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg bg-surface-alt border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary-light">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground text-sm">
                    {review.author}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-medium">{review.rating}</span>
                  <span className="text-xs text-muted ml-1">{RATING_LABELS[review.rating]}</span>
                </div>
              </div>
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted/60">{review.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-6">
          No reviews yet. Be the first to rate this place!
        </p>
      )}
    </section>
  );
}