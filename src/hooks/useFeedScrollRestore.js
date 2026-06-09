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

  const finishRestore = useCallback(() => {
    restoringScrollRef.current = false;
    pendingRestoreScrollYRef.current = null;
    pendingRestoreAnchorIdRef.current = null;
    isHydratingRef.current = false;
    setIsRestoring(false);
  }, []);

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
          finishRestore();
          return;
        }
        if (attempts >= maxAttempts) {
          finishRestore();
          return;
        }

        attempts += 1;
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },
    [enabled, finishRestore]
  );

  const restoreAnchorWithRetry = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    restoringScrollRef.current = true;
    setIsRestoring(true);
    let attempts = 0;
    const maxAttempts = 600;

    const tick = () => {
      const anchorId = pendingRestoreAnchorIdRef.current;
      if (anchorId == null) {
        finishRestore();
        return;
      }

      const target = document.querySelector(`[data-feed-item-id="${anchorId}"]`);
      if (target) {
        target.scrollIntoView({ block: "center" });
        finishRestore();
        return;
      }

      if (attempts >= maxAttempts) {
        const fallbackY = pendingRestoreScrollYRef.current;
        pendingRestoreAnchorIdRef.current = null;
        if (typeof fallbackY === "number") {
          restoreScrollWithRetry(fallbackY);
          return;
        }
        finishRestore();
        return;
      }

      attempts += 1;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [enabled, finishRestore, restoreScrollWithRetry]);

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
      if (typeof parsed?.scrollY === "number") {
        pendingRestoreScrollYRef.current = parsed.scrollY;
      }
      if (parsed?.anchorId != null) {
        pendingRestoreAnchorIdRef.current = String(parsed.anchorId);
        setIsRestoring(true);
      } else if (typeof parsed?.scrollY === "number") {
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
      if (pendingRestoreAnchorIdRef.current == null && pendingRestoreScrollYRef.current == null) {
        isHydratingRef.current = false;
        setIsRestoring(false);
      }
    }, 5000);
    return () => {
      if (hydrationTimeout) clearTimeout(hydrationTimeout);
    };
  }, [enabled, storageKey]);

  useEffect(() => {
    if (!enabled) return;
    if (itemCount === 0) return;
    if (pendingRestoreAnchorIdRef.current != null) {
      restoreAnchorWithRetry();
      return;
    }
    if (pendingRestoreScrollYRef.current == null) return;
    restoreScrollWithRetry(pendingRestoreScrollYRef.current);
  }, [enabled, itemCount, restoreAnchorWithRetry, restoreScrollWithRetry]);

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
