import React from "react";

const getImageDebugDelayMs = () => {
  if (typeof window === "undefined") return 0;
  const enabledRaw = localStorage.getItem("settings_imageDebugDelayEnabled");
  const enabled = enabledRaw ? JSON.parse(enabledRaw) : false;
  if (!enabled) return 0;
  const raw = Number(localStorage.getItem("settings_imageDebugDelayMs") ?? 700);
  if (!Number.isFinite(raw)) return 700;
  return Math.max(0, Math.min(raw, 5000));
};

function detectImageMimeFromBase64(base64) {
  if (!base64 || typeof base64 !== "string") return "image/jpeg";
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

function normalizeInlineImage(imageValue) {
  if (!imageValue || typeof imageValue !== "string") return null;
  if (/^data:image\//.test(imageValue)) return imageValue;
  if (/^[A-Za-z0-9+/=]+$/.test(imageValue) && imageValue.length > 100) {
    return `data:${detectImageMimeFromBase64(imageValue)};base64,${imageValue}`;
  }
  return imageValue;
}

export function useItemImage({
  itemId,
  itemImage,
  compact = false,
  enableLazyImageFetch = false,
  fetchByIdWhenMissing = true,
  lazyUrlBuilder = (id) => `/api/objects/${id}/thumbnail`,
  observerRootMargin = "200px 0px",
}) {
  const containerRef = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [debugDelayMs, setDebugDelayMs] = React.useState(() => getImageDebugDelayMs());
  const [delayReady, setDelayReady] = React.useState(() => {
    const d = getImageDebugDelayMs();
    if (d <= 0) return true;
    // Dev delay simulates slow thumbnail API only — not data already on the item (cache / list payload).
    return Boolean(normalizeInlineImage(itemImage));
  });

  React.useEffect(() => {
    const sync = () => setDebugDelayMs(getImageDebugDelayMs());
    sync();
    if (typeof window === "undefined") return;
    window.addEventListener("settings-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("settings-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  React.useEffect(() => {
    setIsVisible(false);
    const inline = normalizeInlineImage(itemImage);
    if (inline) {
      setDelayReady(true);
    } else {
      setDelayReady(debugDelayMs <= 0);
    }
  }, [itemId, itemImage, compact, enableLazyImageFetch, debugDelayMs]);

  React.useEffect(() => {
    if (debugDelayMs <= 0) return;
    if (normalizeInlineImage(itemImage)) return;
    const timer = setTimeout(() => setDelayReady(true), debugDelayMs);
    return () => clearTimeout(timer);
  }, [itemId, itemImage, compact, enableLazyImageFetch, debugDelayMs]);

  React.useEffect(() => {
    if (!enableLazyImageFetch || compact || itemImage) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: observerRootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enableLazyImageFetch, compact, itemImage, itemId, observerRootMargin]);

  const inlineImageSrc = normalizeInlineImage(itemImage);
  const shouldAttemptIdFallback =
    !compact &&
    !inlineImageSrc &&
    !!itemId &&
    (enableLazyImageFetch ? true : fetchByIdWhenMissing);

  const shouldUseIdFallback =
    !compact &&
    !inlineImageSrc &&
    itemId &&
    delayReady &&
    (enableLazyImageFetch ? isVisible : fetchByIdWhenMissing);

  const lazyImageSrc =
    shouldUseIdFallback
      ? lazyUrlBuilder(itemId)
      : null;

  const imageSrc = inlineImageSrc || lazyImageSrc;
  const isWaitingForIdImage =
    shouldAttemptIdFallback && (enableLazyImageFetch ? (!isVisible || !delayReady) : !delayReady);
  const isWaitingForLazyImage = isWaitingForIdImage;

  return {
    containerRef,
    imageSrc,
    isWaitingForLazyImage,
  };
}
