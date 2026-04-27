import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAuthHeadersSafe } from "@/utils/token";

const PAGE_SIZE = 10;
const FEED_CACHE_TTL_MS = 30000;
const feedResponseCache = new Map();
const feedInFlight = new Map();

export function useStocktakingFeed({
  eventId,
  sortBy,
  sortOrder,
  searchTerm,
  filterState,
  location,
  enabled = true,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef({ id: null, sortValue: null });

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        eventId,
        sortBy,
        sortOrder,
        searchTerm,
        state: filterState?.state || [],
        hasNote: filterState?.hasNote || [],
        room: location?.room || null,
        storey: location?.storey || null,
        building: location?.building || null,
      }),
    [eventId, sortBy, sortOrder, searchTerm, filterState?.state, filterState?.hasNote, location?.room, location?.storey, location?.building]
  );
  const cacheKey = useMemo(() => `stocktakingFeedCache_${queryKey}`, [queryKey]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    cursorRef.current = { id: null, sortValue: null };
  }, []);

  useEffect(() => {
    reset();
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (!cached || !Array.isArray(cached.items)) return;
      setItems(cached.items);
      setHasMore(Boolean(cached.hasMore));
      cursorRef.current = cached.cursor && cached.cursor.id
        ? { id: cached.cursor.id, sortValue: cached.cursor.sortValue ?? null }
        : { id: null, sortValue: null };
    } catch (_e) {}
  }, [queryKey, cacheKey, reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          items,
          hasMore,
          cursor: cursorRef.current,
          ts: Date.now(),
        })
      );
    } catch (_e) {}
  }, [cacheKey, items, hasMore]);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasMore || !eventId) return;
    setLoading(true);
    setError(null);
    try {
      const body = {
        eventId,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
        search: searchTerm || "",
        state: filterState?.state || [],
        hasNote: filterState?.hasNote || [],
        roomId: location?.room || null,
        storeyId: location?.storey || null,
        buildingId: location?.building || null,
        noLocation: false,
      };
      if (cursorRef.current.id) {
        body.cursorId = cursorRef.current.id;
        body.cursorSortValue = cursorRef.current.sortValue ?? null;
      }
      const requestKey = JSON.stringify(body);
      const now = Date.now();
      const cached = feedResponseCache.get(requestKey);
      let data;
      if (cached && now - cached.ts < FEED_CACHE_TTL_MS) {
        data = cached.data;
      } else if (feedInFlight.has(requestKey)) {
        data = await feedInFlight.get(requestKey);
      } else {
        const requestPromise = fetch("/api/objects/feed", {
          method: "POST",
          headers: getAuthHeadersSafe(),
          body: JSON.stringify(body),
        }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
          return res.json();
        });
        feedInFlight.set(requestKey, requestPromise);
        try {
          data = await requestPromise;
          feedResponseCache.set(requestKey, { ts: now, data });
        } finally {
          feedInFlight.delete(requestKey);
        }
      }
      const nextItems = data.items || [];
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const appended = nextItems.filter((x) => !seen.has(x.id));
        return [...prev, ...appended];
      });
      cursorRef.current = data.nextCursorId
        ? { id: data.nextCursorId, sortValue: data.nextCursorSortValue ?? null }
        : { id: null, sortValue: null };
      setHasMore(Boolean(data.hasMore));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [enabled, loading, hasMore, eventId, sortBy, sortOrder, searchTerm, filterState?.state, filterState?.hasNote, location?.room, location?.storey, location?.building]);

  return { items, loading, error, hasMore, loadMore, reset };
}
