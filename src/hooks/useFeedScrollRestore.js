import { useCallback, useEffect, useRef } from "react";

export function useFeedScrollRestore({
  storageKey,
  itemCount,
  hasMore,
  loading,
  loadMore,
  enabled = true,
}) {
  const restoringScrollRef = useRef(false);
  const pendingRestoreScrollYRef = useRef(null);
  const isHydratingRef = useRef(true);
  const hasMoreRef = useRef(false);
  const loadingRef = useRef(false);

  const persistScrollState = useCallback(() => {
    if (!enabled || typeof window === "undefined" || isHydratingRef.current) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ scrollY: window.scrollY, ts: Date.now() })
      );
    } catch (_e) {}
  }, [enabled, storageKey]);

  const restoreScrollWithRetry = useCallback(
    (targetY) => {
      if (!enabled || typeof window === "undefined" || typeof targetY !== "number") return;
      restoringScrollRef.current = true;
      let attempts = 0;
      const maxAttempts = 300;

      const tick = () => {
        window.scrollTo(0, targetY);
        const maxScrollableY = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const reached = Math.abs(window.scrollY - Math.min(targetY, maxScrollableY)) <= 2;
        const enoughHeight = maxScrollableY >= targetY - 2;
        const canStillGrow = hasMoreRef.current || loadingRef.current;

        if (reached || (enoughHeight && attempts > 2)) {
          restoringScrollRef.current = false;
          pendingRestoreScrollYRef.current = null;
          isHydratingRef.current = false;
          return;
        }
        if (attempts >= maxAttempts && !canStillGrow) {
          restoringScrollRef.current = false;
          pendingRestoreScrollYRef.current = null;
          isHydratingRef.current = false;
          return;
        }

        attempts += 1;
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },
    [enabled]
  );

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    isHydratingRef.current = true;
    let hydrationTimeout = null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        isHydratingRef.current = false;
        return;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed?.scrollY === "number") {
        pendingRestoreScrollYRef.current = parsed.scrollY;
      } else {
        isHydratingRef.current = false;
      }
    } catch (_e) {
      isHydratingRef.current = false;
    }
    hydrationTimeout = setTimeout(() => {
      isHydratingRef.current = false;
    }, 5000);
    return () => {
      if (hydrationTimeout) clearTimeout(hydrationTimeout);
    };
  }, [enabled, storageKey]);

  useEffect(() => {
    if (!enabled) return;
    if (pendingRestoreScrollYRef.current == null) return;
    if (itemCount === 0) return;
    restoreScrollWithRetry(pendingRestoreScrollYRef.current);
  }, [enabled, itemCount, restoreScrollWithRetry]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (pendingRestoreScrollYRef.current == null) return;
    if (loading || !hasMore) return;
    const targetY = pendingRestoreScrollYRef.current;
    const maxScrollableY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (maxScrollableY + 2 < targetY) {
      loadMore?.();
    }
  }, [enabled, itemCount, loading, hasMore, loadMore]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onScroll = () => persistScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    persistScrollState();
    return () => {
      persistScrollState();
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, persistScrollState]);

  return { persistScrollState };
}
