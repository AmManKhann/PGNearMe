export const FOCUS_SEARCH_EVENT = "pgnearme:focus-search";
export const FOCUS_PENDING_KEY = "pgnearme:focus-pending";
export const CITY_SELECT_EVENT = "pgnearme:city-select";

export const SEARCH_PAGES = new Set([
  "/",
  "/search",
  "/search/house",
  "/search/office",
  "/search/shop",
]);

export function focusSearch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FOCUS_SEARCH_EVENT));
}

export function markSearchFocusPending() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FOCUS_PENDING_KEY, "1");
  } catch {
    /* storage unavailable */
  }
}