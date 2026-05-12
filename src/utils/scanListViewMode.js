const STORAGE_KEY = "scanListViewMode";
const VALID = new Set(["grid", "detailed", "compact"]);

export function readScanListViewMode() {
    if (typeof window === "undefined") return "detailed";
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return VALID.has(v) ? v : "detailed";
    } catch (_e) {
        return "detailed";
    }
}
