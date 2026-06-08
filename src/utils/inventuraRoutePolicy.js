/**
 * Default: every route needs Zahájený inventura.
 * Exceptions below only.
 */
const EXEMPT_EXACT_PATHS = new Set([
  "/stocktakingList", // výběr inventury (bez aktivní je jinak dead-end)
  "/error",
  "/unavailable",
]);

/** Jen seznam základního RM — bez vazby na inventuru. */
const EXEMPT_PREFIXES = ["/base-items"];

const STOCKTAKING_ID_PATH = /^\/stocktakingList\/(\d+)(?:\/|$)/;

function isExemptPath(pathname) {
  if (!pathname) return true;
  if (EXEMPT_EXACT_PATHS.has(pathname)) return true;
  return EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * @returns {{ required: false } | { required: true, stocktakingId: number | null }}
 */
export function getInventuraRouteRequirement(pathname) {
  if (isExemptPath(pathname)) {
    return { required: false };
  }

  const stocktakingMatch = pathname.match(STOCKTAKING_ID_PATH);
  if (stocktakingMatch) {
    const stocktakingId = Number.parseInt(stocktakingMatch[1], 10);
    return {
      required: true,
      stocktakingId: Number.isFinite(stocktakingId) ? stocktakingId : null,
    };
  }

  return { required: true, stocktakingId: null };
}
