/** In-memory feed API cache (shared module scope — cleared on inventura switch). */
export const stocktakingFeedResponseCache = new Map();
export const stocktakingFeedInFlight = new Map();

const LEGACY_FEED_SESSION_PREFIX = "stocktakingFeedCache_v7_";
const LIST_SCROLL_PREFIX = "stocktakingListScroll_";
const SCAN_SCROLL_PREFIX = "stocktakingScanScroll_";

const INVENTURA_SESSION_PREFIXES = [
  LEGACY_FEED_SESSION_PREFIX,
  LIST_SCROLL_PREFIX,
  SCAN_SCROLL_PREFIX,
];

export function clearStocktakingFeedMemoryCache() {
  stocktakingFeedResponseCache.clear();
  stocktakingFeedInFlight.clear();
}

/** Legacy feed list snapshots only (safe on filter/sort change). */
export function clearLegacyFeedSessionStorage() {
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(LEGACY_FEED_SESSION_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}

/** Feed leftovers + list/scan scroll restore — use on inventura switch. */
export function clearInventuraSessionStorage() {
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    if (INVENTURA_SESSION_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      sessionStorage.removeItem(key);
    }
  }
}

/** Call when the active inventura changes — drop stale list/scroll/API cache. */
export function clearAllInventuraEphemeralCaches() {
  clearStocktakingFeedMemoryCache();
  clearInventuraSessionStorage();
}
