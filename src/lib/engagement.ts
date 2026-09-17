"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  tags: string[];
}

interface EngagementData {
  likes: Record<string, boolean>;
  reviews: Record<string, ReviewItem[]>;
}

const STORAGE_KEY = "pgnearme_engagement";

const empty: EngagementData = { likes: {}, reviews: {} };

let current: EngagementData = empty;
let hydrated = false;

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

function getSnapshot(): EngagementData {
  if (typeof window !== "undefined" && !hydrated) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EngagementData>;
        current =
          typeof parsed === "object" && parsed !== null
            ? {
                likes: parsed.likes ?? {},
                reviews: parsed.reviews ?? {},
              }
            : empty;
      }
    } catch {
      /* fall back to empty */
    }
    hydrated = true;
  }
  return current;
}

function getServerSnapshot(): EngagementData {
  return empty;
}

function mutate(updater: (prev: EngagementData) => EngagementData) {
  current = updater(current);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
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
    (entityId: string) => Boolean(data.likes[entityId]),
    [data.likes]
  );

  const toggleLike = useCallback((entityId: string) => {
    mutate((prev) => ({
      likes: { ...prev.likes, [entityId]: !prev.likes[entityId] },
      reviews: prev.reviews,
    }));
  }, []);

  const addReview = useCallback((entityId: string, review: ReviewItem) => {
    mutate((prev) => ({
      likes: prev.likes,
      reviews: {
        ...prev.reviews,
        [entityId]: [review, ...(prev.reviews[entityId] ?? [])],
      },
    }));
  }, []);

  const getStoredReviews = useCallback(
    (entityId: string) => data.reviews[entityId] ?? [],
    [data.reviews]
  );

  return { isLiked, toggleLike, addReview, getStoredReviews };
}