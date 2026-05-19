/**
 * Contextual navigation: pass returnTo on cross-screen links so back/save
 * returns to where the user came from.
 */

export const HOME_PATH = "/";

export function stocktakingListPath(stocktakingId) {
  return `/stocktakingList/${stocktakingId}`;
}

export function scanPath(stocktakingId) {
  return `/stocktakingList/${stocktakingId}/scan`;
}

function withReturnTo(path, returnTo) {
  if (!returnTo) return path;
  const params = new URLSearchParams();
  params.set("returnTo", returnTo);
  return `${path}?${params.toString()}`;
}

function buildFormPageUrl(path, { returnTo, qr } = {}) {
  const params = new URLSearchParams();
  if (returnTo) params.set("returnTo", returnTo);
  if (qr) params.set("qr", String(qr).trim());
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

export function buildStocktakingListUrl(stocktakingId, { returnTo } = {}) {
  return withReturnTo(stocktakingListPath(stocktakingId), returnTo);
}

export function buildScanUrl(stocktakingId, { returnTo } = {}) {
  return withReturnTo(scanPath(stocktakingId), returnTo);
}

export function buildStocktakingItemUrl(stocktakingId, itemId, { returnTo, edit = false } = {}) {
  const params = new URLSearchParams();
  if (edit) params.set("edit", "1");
  if (returnTo) params.set("returnTo", returnTo);
  const q = params.toString();
  return `/stocktakingList/${stocktakingId}/${itemId}${q ? `?${q}` : ""}`;
}

export function buildNewItemUrl({ returnTo, qr } = {}) {
  return buildFormPageUrl("/newItem", { returnTo, qr });
}

export function buildLinkItemUrl({ returnTo, qr } = {}) {
  return buildFormPageUrl("/linkItem", { returnTo, qr });
}

export function resolveScreenReturnTo(searchParams, fallback = HOME_PATH) {
  const fromQuery = searchParams?.get?.("returnTo");
  return fromQuery || fallback;
}

export function resolveReturnTo(searchParams, selectedInventuraId) {
  const fromQuery = searchParams?.get?.("returnTo");
  if (fromQuery) return fromQuery;
  if (selectedInventuraId) return stocktakingListPath(selectedInventuraId);
  return HOME_PATH;
}

export function isHomeReturnTo(returnTo) {
  return returnTo === HOME_PATH || returnTo === "";
}

export function backIconForReturnTo(returnTo) {
  return isHomeReturnTo(returnTo) ? "home" : "arrow_back";
}

/** HeadingCard left action for contextual back navigation. */
export function headingBackAction(returnTo, { title = "Zpět" } = {}) {
  return {
    icon: backIconForReturnTo(returnTo),
    href: returnTo,
    title,
  };
}
