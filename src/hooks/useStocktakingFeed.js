import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { getAuthHeadersSafe } from "@/utils/token";
import { useSettings } from "@/hooks/useSettings";
import { INVENTORY_STATES, INVENTORY_STATES_WITHOUT_UNCHECKED, INVENTORY_DISPLAY_MODE } from "@/utils/inventoryStates";
import {
  feedCanAppendMore,
  feedHighlightPage1Based,
  mergeFeedPageIntoItems,
  parsePagedFeedPage,
} from "@/utils/feedPagination";

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
  const { itemsPerPage, inventoryDisplayMode } = useSettings();

  const effectiveFeedState = useMemo(() => {
    const raw = filterState?.state || [];
    let states = [...raw];
    if (inventoryDisplayMode === INVENTORY_DISPLAY_MODE.WORKFLOW) {
      states = states.filter((s) => s !== INVENTORY_STATES.UNCHECKED);
      if (states.length === 0) {
        states = [...INVENTORY_STATES_WITHOUT_UNCHECKED];
      }
    }
    return states;
  }, [filterState?.state, inventoryDisplayMode]);

  const pageSize = itemsPerPage;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [viewPageIndex, setViewPageIndex] = useState(0);
  const [nextAppendPage0, setNextAppendPage0] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        eventId,
        sortBy,
        sortOrder,
        searchTerm,
        state: effectiveFeedState,
        displayMode: inventoryDisplayMode,
        hasNote: filterState?.hasNote || [],
        pageSize,
        room: location?.room || null,
        storey: location?.storey || null,
        building: location?.building || null,
      }),
    [eventId, sortBy, sortOrder, searchTerm, effectiveFeedState, inventoryDisplayMode, filterState?.hasNote, pageSize, location?.room, location?.storey, location?.building]
  );
  const cacheKey = useMemo(() => `stocktakingFeedCache_v7_${queryKey}`, [queryKey]);

  const feedRequestId = useRef(0);
  const appendLock = useRef(false);

  const reset = useCallback(() => {
    setItems([]);
    setTotal(0);
    setViewPageIndex(0);
    setNextAppendPage0(0);
    setHasMore(true);
    setError(null);
  }, []);

  const loadPageFromApi = useCallback(
    async (pageIndex0) => {
      if (!enabled || !eventId) throw new Error("feed disabled");
      const body = {
        eventId,
        page: pageIndex0,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: searchTerm || "",
        state: effectiveFeedState,
        hasNote: filterState?.hasNote || [],
        roomId: location?.room || null,
        storeyId: location?.storey || null,
        buildingId: location?.building || null,
      };
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
      return parsePagedFeedPage(data);
    },
    [enabled, eventId, sortBy, sortOrder, searchTerm, effectiveFeedState, filterState?.hasNote, pageSize, location?.room, location?.storey, location?.building]
  );

  const replaceToPage0 = useCallback(
    async (pageIndex0, opts = {}) => {
      if (!enabled || !eventId) return;
      const syncPaint = opts?.syncPaint !== false;
      const id = ++feedRequestId.current;
      const applyPendingUi = () => {
        setViewPageIndex(pageIndex0);
        setItems([]);
        setLoading(true);
        setError(null);
      };
      if (syncPaint) {
        flushSync(applyPendingUi);
      } else {
        applyPendingUi();
      }
      try {
        const { pageItems, resolvedTotal, hasMoreNext } = await loadPageFromApi(pageIndex0);
        if (id !== feedRequestId.current) return;
        setTotal(resolvedTotal);
        setItems(pageItems);
        setNextAppendPage0(pageIndex0 + 1);
        setHasMore(hasMoreNext);
      } catch (e) {
        if (id === feedRequestId.current) setError(e);
      } finally {
        if (id === feedRequestId.current) setLoading(false);
      }
    },
    [enabled, eventId, loadPageFromApi]
  );

  const appendNextChunk = useCallback(async () => {
    if (!enabled || !eventId) return;
    if (!feedCanAppendMore(nextAppendPage0, total, pageSize)) return;
    if (appendLock.current) return;
    appendLock.current = true;
    const id = ++feedRequestId.current;
    const pageToFetch = nextAppendPage0;
    flushSync(() => {
      setLoading(true);
      setError(null);
    });
    try {
      const { pageItems, resolvedTotal, hasMoreNext } = await loadPageFromApi(pageToFetch);
      if (id !== feedRequestId.current) return;
      setTotal(resolvedTotal);
      setItems((prev) => mergeFeedPageIntoItems(prev, pageItems));
      setNextAppendPage0((p) => p + 1);
      setHasMore(hasMoreNext);
    } catch (e) {
      if (id === feedRequestId.current) setError(e);
    } finally {
      appendLock.current = false;
      if (id === feedRequestId.current) setLoading(false);
    }
  }, [enabled, eventId, total, nextAppendPage0, pageSize, loadPageFromApi]);

  const replaceToPage0Ref = useRef(replaceToPage0);
  replaceToPage0Ref.current = replaceToPage0;

  const goToPage1Based = useCallback((page1Based) => {
    const p0 = page1Based - 1;
    if (p0 < 0) return;
    void replaceToPage0(p0);
  }, [replaceToPage0]);

  /** Re-fetch page 0 (e.g. after mutations). Name kept for callers; not infinite-scroll append. */
  const loadMore = useCallback(() => {
    void replaceToPage0(0, { syncPaint: false });
  }, [replaceToPage0]);

  useLayoutEffect(() => {
    let fromCache = false;
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const cached = JSON.parse(raw);
          const vp = Number(cached.viewPageIndex);
          if (Array.isArray(cached.items) && cached.items.length > 0 && Number.isInteger(vp) && vp >= 0) {
            const nap = Number(cached.nextAppendPage0);
            const derivedNext =
              Number.isInteger(nap) && nap >= 0
                ? nap
                : Math.max(vp + 1, Math.ceil(cached.items.length / pageSize));
            setItems(cached.items);
            setTotal(Number(cached.total) || 0);
            setViewPageIndex(vp);
            setNextAppendPage0(derivedNext);
            setHasMore(Boolean(cached.hasMoreNext));
            setError(null);
            fromCache = true;
          }
        }
      } catch (_e) {}
    }
    if (!fromCache) {
      reset();
      if (enabled && eventId) {
        void replaceToPage0Ref.current(0);
      }
    }
  }, [queryKey, cacheKey, reset, enabled, eventId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading && items.length === 0) return;
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          items,
          total,
          viewPageIndex,
          nextAppendPage0,
          hasMoreNext: hasMore,
          ts: Date.now(),
        })
      );
    } catch (_e) {}
  }, [cacheKey, items, total, viewPageIndex, nextAppendPage0, hasMore, loading]);

  const highlightPage1Based = useMemo(
    () => feedHighlightPage1Based(viewPageIndex, nextAppendPage0, total, pageSize),
    [viewPageIndex, nextAppendPage0, total, pageSize]
  );
  const canAppendMore = useMemo(
    () => feedCanAppendMore(nextAppendPage0, total, pageSize),
    [nextAppendPage0, total, pageSize]
  );

  return {
    items,
    total,
    viewPageIndex,
    nextAppendPage0,
    loading,
    error,
    hasMore,
    goToPage1Based,
    appendNextChunk,
    reset,
    loadMore,
    pageSize,
    highlightPage1Based,
    canAppendMore,
  };
}
