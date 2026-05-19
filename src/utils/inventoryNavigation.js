/**
 * Contextual navigation: pass returnTo on cross-screen links so back/save
 * returns to where the user came from.
 */

import { INVENTORY_STATES } from "@/utils/inventoryStates";

export const HOME_PATH = "/";

/** Main menu — přidat / propojit před aktivní inventurou → Nezkontrolováno */
export const MAIN_MENU_NEW_ITEM_PATH = "/newItem";
export const MAIN_MENU_LINK_ITEM_PATH = "/linkItem";

const MAIN_MENU_ADD_PATHS = [MAIN_MENU_NEW_ITEM_PATH, MAIN_MENU_LINK_ITEM_PATH];

export function isMainMenuAddPath(pathname) {
  if (!pathname) return false;
  return MAIN_MENU_ADD_PATHS.some(
    (p) => pathname === p || pathname.endsWith(p)
  );
}

/** Create or link: main menu → Nezkontrolováno, inventura routes → Nový */
export function resolveAddToInventuraState(pathname) {
  return isMainMenuAddPath(pathname)
    ? INVENTORY_STATES.UNCHECKED
    : INVENTORY_STATES.NEW;
}

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

export function stocktakingNewItemPath(stocktakingId) {
  return `/stocktakingList/${stocktakingId}/new`;
}

export function stocktakingLinkItemPath(stocktakingId) {
  return `/stocktakingList/${stocktakingId}/link`;
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

/** Main menu create → /newItem (Nezkontrolováno) */
export function buildNewItemUrl({ returnTo, qr } = {}) {
  return buildFormPageUrl(MAIN_MENU_NEW_ITEM_PATH, { returnTo, qr });
}

/** Inventura list / scan create → /stocktakingList/{id}/new (Nový) */
export function buildStocktakingNewItemUrl(stocktakingId, { returnTo, qr } = {}) {
  return buildFormPageUrl(stocktakingNewItemPath(stocktakingId), { returnTo, qr });
}

/** Main menu link → /linkItem (Nezkontrolováno) */
export function buildLinkItemUrl({ returnTo, qr } = {}) {
  return buildFormPageUrl(MAIN_MENU_LINK_ITEM_PATH, { returnTo, qr });
}

/** Inventura list / scan link → /stocktakingList/{id}/link (Nový) */
export function buildStocktakingLinkItemUrl(stocktakingId, { returnTo, qr } = {}) {
  return buildFormPageUrl(stocktakingLinkItemPath(stocktakingId), { returnTo, qr });
}

export function resolveScreenReturnTo(searchParams, fallback = HOME_PATH) {
  const fromQuery = searchParams?.get?.("returnTo");
  return fromQuery || fallback;
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
