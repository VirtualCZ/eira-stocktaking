/**
 * Shared math for paged feeds (replace page + append-next-chunk).
 * API uses 0-based `page`; UI uses 1-based page numbers.
 */

/** Number of API pages for this total (always ≥ 1). */
export function feedTotalApiPages(total, pageSize) {
    const t = Math.max(0, Number(total) || 0);
    const ps = Math.max(1, pageSize);
    return Math.max(1, Math.ceil(t / ps));
}

/** 1-based pagination highlight: max(replace page, append frontier), clamped to total pages. */
export function feedHighlightPage1Based(viewPageIndex0, nextAppendPage0, total, pageSize) {
    const tp = feedTotalApiPages(total, pageSize);
    return Math.min(Math.max(viewPageIndex0 + 1, Math.max(1, nextAppendPage0)), tp);
}

export function feedCanAppendMore(nextAppendPage0, total, pageSize) {
    return nextAppendPage0 < feedTotalApiPages(total, pageSize);
}

/** Append fetch: add `pageItems` to `prev` without duplicate ids. */
export function mergeFeedPageIntoItems(prev, pageItems) {
    const seen = new Set(prev.map((i) => i.id));
    return [...prev, ...pageItems.filter((i) => !seen.has(i.id))];
}

/** Parse paged feed JSON: `items`, `total`, `hasMoreNext` only. */
export function parsePagedFeedPage(data) {
    const pageItems = Array.isArray(data?.items) ? data.items : [];
    const raw = Number(data?.total);
    const resolvedTotal = Number.isFinite(raw) && raw >= 0 ? raw : 0;
    return { pageItems, resolvedTotal, hasMoreNext: Boolean(data?.hasMoreNext) };
}
