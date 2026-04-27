import { useCallback, useEffect, useRef, useState } from "react";

export function useFeedScrollRestore({
  storageKey,
  itemCount,
  enabled = true,
}) {
  const restoringScrollRef = useRef(false);
  const pendingRestoreScrollYRef = useRef(null);
  const pendingRestoreAnchorIdRef = useRef(null);
  const isHydratingRef = useRef(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const persistScrollState = useCallback((meta = {}) => {
    if (!enabled || typeof window === "undefined" || isHydratingRef.current) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          scrollY: window.scrollY,
          anchorId: meta?.anchorId ?? null,
          ts: Date.now(),
        })
      );
    } catch (_e) {}
  }, [enabled, storageKey]);

  const restoreScrollWithRetry = useCallback(
    (targetY) => {
      if (!enabled || typeof window === "undefined" || typeof targetY !== "number") return;
      restoringScrollRef.current = true;
      setIsRestoring(true);
      let attempts = 0;
      const maxAttempts = 600;

      const tick = () => {
        window.scrollTo(0, targetY);
        const maxScrollableY = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const enoughHeight = maxScrollableY >= targetY - 2;
        const reached = enoughHeight && Math.abs(window.scrollY - targetY) <= 2;

        if (reached || (enoughHeight && attempts > 2)) {
          restoringScrollRef.current = false;
          pendingRestoreScrollYRef.current = null;
          isHydratingRef.current = false;
          setIsRestoring(false);
          return;
        }
        if (attempts >= maxAttempts) {
          restoringScrollRef.current = false;
          pendingRestoreScrollYRef.current = null;
          isHydratingRef.current = false;
          setIsRestoring(false);
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
    if (!enabled || typeof window === "undefined") return;
    isHydratingRef.current = true;
    let hydrationTimeout = null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        isHydratingRef.current = false;
        setIsRestoring(false);
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.anchorId != null) {
        pendingRestoreAnchorIdRef.current = String(parsed.anchorId);
        setIsRestoring(true);
      } else if (typeof parsed?.scrollY === "number") {
        pendingRestoreScrollYRef.current = parsed.scrollY;
        setIsRestoring(true);
      } else {
        isHydratingRef.current = false;
        setIsRestoring(false);
      }
    } catch (_e) {
      isHydratingRef.current = false;
      setIsRestoring(false);
    }
    hydrationTimeout = setTimeout(() => {
      isHydratingRef.current = false;
      setIsRestoring(false);
    }, 5000);
    return () => {
      if (hydrationTimeout) clearTimeout(hydrationTimeout);
    };
  }, [enabled, storageKey]);

  useEffect(() => {
    if (!enabled) return;
    if (pendingRestoreAnchorIdRef.current != null) {
      const anchorId = pendingRestoreAnchorIdRef.current;
      if (typeof document !== "undefined") {
        const target = document.querySelector(`[data-feed-item-id="${anchorId}"]`);
        if (target) {
          target.scrollIntoView({ block: "center" });
          pendingRestoreAnchorIdRef.current = null;
          pendingRestoreScrollYRef.current = null;
          isHydratingRef.current = false;
          restoringScrollRef.current = false;
          setIsRestoring(false);
        }
      }
      return;
    }
    if (pendingRestoreScrollYRef.current == null) return;
    if (itemCount === 0) return;
    restoreScrollWithRetry(pendingRestoreScrollYRef.current);
  }, [enabled, itemCount, restoreScrollWithRetry]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onScroll = () => persistScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, persistScrollState]);

  return { persistScrollState, isRestoring };
}
