"use client";

import { useEffect, useState } from "react";
import { Star, PenLine, Tag, User, Phone, Mail, ShieldCheck } from "lucide-react";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

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
  const { addReview, getStoredReviews, hydrateListing, hasReviewed } = useEngagement();
  const stored = getStoredReviews(key);
  const reviewed = clientReady && hasReviewed(key);
  const all = [...stored, ...seedReviews];
  const avg = all.length > 0 ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (clientReady) hydrateListing(key);
  }, [clientReady, key, hydrateListing]);

  const phoneValid = PHONE_RE.test(phone.replace(/[\s\-()]/g, "").replace(/^\+91/, ""));
  const emailValid = EMAIL_RE.test(email.trim());
  const nameValid = name.trim().length >= 2;
  const canSubmit =
    rating > 0 && tags.length > 0 && nameValid && phoneValid && emailValid;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!clientReady || reviewed || !canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    setTouched(true);
    const result = await addReview(
      key,
      {
        id: ``,
        author: name.trim(),
        rating,
        date: "Just now",
        tags,
      },
      { name: name.trim(), phone: phone.trim(), email: email.trim() }
    );
    setSubmitting(false);
    if (result.ok) {
      setRating(0);
      setTags([]);
      setName("");
      setPhone("");
      setEmail("");
      setTouched(false);
      setOpen(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 3000);
    } else {
      setError(result.error || "Something went wrong. Try again.");
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-accent";

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
          Thanks for your rating! Your review has been submitted.
        </div>
      )}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {reviewed ? (
        <div className="mb-6 p-4 rounded-lg bg-surface-alt border border-border">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            You already reviewed this place on this device
          </p>
          <p className="text-sm text-muted mt-1">
            Thanks! One review per device is allowed, so the rating form is now hidden here.
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-surface-alt border border-border">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full flex items-center gap-2 py-2.5 px-4 rounded-lg border border-primary/40 bg-primary/5 hover:bg-primary/10 text-foreground font-medium transition-all"
          >
            <PenLine className="w-4 h-4 text-primary-light" />
            Write a review
          </button>
        ) : (
          <>
        <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <PenLine className="w-4 h-4 text-primary-light" />
          Rate this place
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        </div>
        <div className={`mb-3 ${touched && rating === 0 ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating value={rating} onChange={(n) => { setRating(n); setTouched(true); }} />
            <span className="text-sm font-medium text-foreground">
              {rating > 0 ? RATING_LABELS[rating] : "Tap to rate"}
            </span>
          </div>
        </div>

        <p className="text-xs font-medium text-muted mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          What did you like? (select at least one)
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <label className="block">
            <span className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Your name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Phone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-muted">
            {rating === 0
              ? "Select a star rating"
              : `${RATING_LABELS[rating]} — ${tags.length} tag${tags.length === 1 ? "" : "s"}`}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
          </>
        )}
      </div>
      )}

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
              <p className="text-xs text-muted/60">
                {Number.isNaN(new Date(review.date).getTime())
                  ? review.date
                  : new Date(review.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
              </p>
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