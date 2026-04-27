/**
 * Compact 1-based page numbers (with "ellipsis" gaps) for many pages.
 * Never lists every page when there are many — at most a handful around `current1Based`.
 * @param {number} current1Based
 * @param {number} totalPages
 * @returns {(number|'ellipsis')[]}
 */
const SHOW_ALL_PAGE_THRESHOLD = 5;

export function paginationPageList(current1Based, totalPages) {
    if (totalPages <= 1) return [1];
    if (totalPages <= SHOW_ALL_PAGE_THRESHOLD) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages]);
    for (let p = current1Based - 2; p <= current1Based + 2; p += 1) {
        if (p >= 1 && p <= totalPages) pages.add(p);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < sorted.length; i += 1) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis");
        out.push(sorted[i]);
    }
    return out;
}
