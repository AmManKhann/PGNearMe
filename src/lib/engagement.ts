"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  tags: string[];
  email?: string;
  phone?: string;
}

interface EngagementState {
  likedKeys: Record<string, boolean>;
  likeCounts: Record<string, number>;
  reviews: Record<string, ReviewItem[]>;
  reviewedKeys: Record<string, boolean>;
}

const STORAGE_KEY = "pgnearme_engagement";
const LIKED_KEY = "pgnearme_liked";
const REVIEWED_KEY = "pgnearme_reviewed";

const empty: EngagementState = {
  likedKeys: {},
  likeCounts: {},
  reviews: {},
  reviewedKeys: {},
};

let current: EngagementState = empty;
let hydrated = false;
const inFlight = new Set<string>();

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function emit() {
  listeners.forEach((callback) => callback());
}

function readLikedKeys(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(LIKED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, boolean>;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { likes?: Record<string, boolean> };
      if (typeof parsed?.likes === "object" && parsed.likes !== null) {
        return parsed.likes;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function readReviewedKeys(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(REVIEWED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, boolean>;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function getSnapshot(): EngagementState {
  if (typeof window !== "undefined" && !hydrated) {
    current = { ...empty, likedKeys: readLikedKeys(), reviewedKeys: readReviewedKeys() };
    hydrated = true;
  }
  return current;
}

function getServerSnapshot(): EngagementState {
  return empty;
}

function applyState(updater: (prev: EngagementState) => EngagementState) {
  current = updater(current);
  try {
    window.localStorage.setItem(LIKED_KEY, JSON.stringify(current.likedKeys));
    window.localStorage.setItem(REVIEWED_KEY, JSON.stringify(current.reviewedKeys));
  } catch {
    /* storage full or unavailable */
  }
  emit();
}

export function useClientReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function useEngagement() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isLiked = useCallback(
    (entityId: string) => Boolean(data.likedKeys[entityId]),
    [data.likedKeys]
  );

  const likeCount = useCallback(
    (entityId: string, seed = 0) => data.likeCounts[entityId] ?? seed,
    [data.likeCounts]
  );

  const getStoredReviews = useCallback(
    (entityId: string) => data.reviews[entityId] ?? [],
    [data.reviews]
  );

  const hasReviewed = useCallback(
    (entityId: string) => Boolean(data.reviewedKeys[entityId]),
    [data.reviewedKeys]
  );

  const hydrateListing = useCallback((entityId: string) => {
    if (inFlight.has(entityId)) return;
    inFlight.add(entityId);
    fetch(`/api/engagement?pgId=${encodeURIComponent(entityId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!res) return;
        applyState((prev) => ({
          ...prev,
          likeCounts: {
            ...prev.likeCounts,
            [entityId]: typeof res.likeCount === "number" ? res.likeCount : 0,
          },
          reviews: {
            ...prev.reviews,
            [entityId]: Array.isArray(res.reviews) ? res.reviews : [],
          },
        }));
      })
      .catch(() => {})
      .finally(() => {
        inFlight.delete(entityId);
      });
  }, []);

  const toggleLike = useCallback((entityId: string) => {
    const prev = current;
    const nextLiked = !prev.likedKeys[entityId];
    const delta = nextLiked ? 1 : -1;
    applyState((s) => ({
      ...s,
      likedKeys: { ...s.likedKeys, [entityId]: nextLiked },
      likeCounts: {
        ...s.likeCounts,
        [entityId]: Math.max(0, (s.likeCounts[entityId] ?? 0) + delta),
      },
    }));
    fetch("/api/engagement/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pgId: entityId, delta }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res && typeof res.likeCount === "number") {
          applyState((s) => ({
            ...s,
            likeCounts: { ...s.likeCounts, [entityId]: res.likeCount },
          }));
        }
      })
      .catch(() => {
        applyState((s) => ({
          ...s,
          likedKeys: { ...s.likedKeys, [entityId]: !nextLiked },
          likeCounts: {
            ...s.likeCounts,
            [entityId]: Math.max(0, (s.likeCounts[entityId] ?? 0) - delta),
          },
        }));
      });
  }, []);

  const addReview = useCallback(
    async (
      entityId: string,
      review: ReviewItem,
      contact: { name: string; phone: string; email: string }
    ): Promise<{ ok: boolean; error?: string }> => {
      const optimisticId = `review-${Date.now()}`;
      applyState((s) => ({
        ...s,
        reviews: {
          ...s.reviews,
          [entityId]: [
            { ...review, id: optimisticId, date: "Just now" },
            ...(s.reviews[entityId] ?? []),
          ],
        },
      }));

      const rollback = () => {
        applyState((s) => ({
          ...s,
          reviews: {
            ...s.reviews,
            [entityId]: (s.reviews[entityId] ?? []).filter(
              (r) => r.id !== optimisticId
            ),
          },
        }));
      };

      try {
        const res = await fetch("/api/engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pgId: entityId,
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            rating: review.rating,
            tags: review.tags,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          applyState((s) => ({
            ...s,
            reviewedKeys: { ...s.reviewedKeys, [entityId]: true },
            reviews: {
              ...s.reviews,
              [entityId]: [
                data.review,
                ...(s.reviews[entityId] ?? []).filter(
                  (r) => r.id !== optimisticId
                ),
              ],
            },
          }));
          return { ok: true };
        }
        const err = await res.json().catch(() => null);
        rollback();
        return { ok: false, error: err?.error || "Something went wrong." };
      } catch {
        rollback();
        return { ok: false, error: "Could not reach the server. Try again." };
      }
    },
    []
  );

  return {
    isLiked,
    likeCount,
    getStoredReviews,
    hasReviewed,
    hydrateListing,
    toggleLike,
    addReview,
  };
}