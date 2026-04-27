"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { usePageState } from "@/hooks/usePageState";
import { getAuthHeadersSafe } from "@/utils/token";
import { useFeedScrollRestore } from "@/hooks/useFeedScrollRestore";
import {
    feedCanAppendMore,
    feedHighlightPage1Based,
    mergeFeedPageIntoItems,
    parsePagedFeedPage,
} from "@/utils/feedPagination";

export const BASE_ITEMS_PAGE_SIZE = 10;
const BASE_ITEMS_FEED_CACHE_VERSION = 9;

const BaseItemsInventoryLayoutContext = createContext(null);

export function BaseItemsInventoryLayoutProvider({ children }) {
    const pathname = usePathname();
    const scrollRestoreActive = pathname === "/base-items";

    const [location, setLocation] = useState(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("baseItemsPage_location");
            return raw ? JSON.parse(raw) : null;
        } catch (_e) {
            return null;
        }
    });

    const [pageState, updatePageState] = usePageState("baseItemsPage", {
        sortBy: "id",
        sortOrder: "asc",
        viewMode: "detailed",
        searchTerm: "",
        filterState: { state: [], hasNote: [] },
        currentPage: 0,
    });

    const locationValues = useMemo(
        () => ({
            building: location?.building ?? null,
            storey: location?.storey ?? null,
            room: location?.room ?? null,
        }),
        [location?.building, location?.storey, location?.room]
    );

    const [locationInitialized, setLocationInitialized] = useState(true);

    const handleLocationChange = useCallback((newLocation) => {
        setLocation(newLocation);
        setLocationInitialized(true);
        if (typeof window !== "undefined") {
            try {
                if (newLocation) {
                    localStorage.setItem("baseItemsPage_location", JSON.stringify(newLocation));
                } else {
                    localStorage.removeItem("baseItemsPage_location");
                }
            } catch (_e) {}
        }
    }, []);

    useEffect(() => {
        if (location && !locationInitialized) {
            setLocationInitialized(true);
        }
    }, [location, locationInitialized]);

    const queryKey = useMemo(
        () =>
            JSON.stringify({
                sortBy: pageState.sortBy,
                sortOrder: pageState.sortOrder,
                searchTerm: pageState.searchTerm,
                room: locationValues.room,
                building: locationValues.building,
                storey: locationValues.storey,
            }),
        [
            pageState.sortBy,
            pageState.sortOrder,
            pageState.searchTerm,
            locationValues.room,
            locationValues.building,
            locationValues.storey,
        ]
    );

    const cacheKey = useMemo(
        () => `baseItemsFeedCache_v${BASE_ITEMS_FEED_CACHE_VERSION}_${queryKey}`,
        [queryKey]
    );

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewPageIndex, setViewPageIndex] = useState(0);
    const [nextAppendPage0, setNextAppendPage0] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const feedRequestId = useRef(0);
    const appendLock = useRef(false);

    const persistFeedState = useCallback(() => {
        if (typeof window === "undefined") return;
        if (loading && items.length === 0) return;
        try {
            sessionStorage.setItem(
                cacheKey,
                JSON.stringify({
                    items,
                    total,
                    viewPageIndex,
                    nextAppendPage0,
                    hasMoreNext: hasMore,
                    ts: Date.now(),
                })
            );
        } catch (_e) {}
    }, [cacheKey, items, total, viewPageIndex, nextAppendPage0, hasMore, loading]);

    const scrollCacheKey = useMemo(() => `baseItemsScroll_${queryKey}`, [queryKey]);
    const { persistScrollState, isRestoring } = useFeedScrollRestore({
        storageKey: scrollCacheKey,
        itemCount: items.length,
        enabled: locationInitialized && scrollRestoreActive,
    });

    const loadPageFromApi = useCallback(
        async (pageIndex0) => {
            const body = {
                page: pageIndex0,
                limit: BASE_ITEMS_PAGE_SIZE,
                sortBy: pageState.sortBy,
                sortOrder: pageState.sortOrder,
                search: pageState.searchTerm || "",
            };
            if (locationValues.room) body.roomId = locationValues.room;
            if (locationValues.storey) body.storeyId = locationValues.storey;
            if (locationValues.building) body.buildingId = locationValues.building;

            const res = await fetch("/api/base-items/feed", {
                method: "POST",
                headers: getAuthHeadersSafe(),
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }
            const data = await res.json();
            return parsePagedFeedPage(data);
        },
        [
            pageState.sortBy,
            pageState.sortOrder,
            pageState.searchTerm,
            locationValues.room,
            locationValues.building,
            locationValues.storey,
        ]
    );

    const replaceToPage0 = useCallback(
        async (pageIndex0) => {
            if (!locationInitialized) return;
            const id = ++feedRequestId.current;
            flushSync(() => {
                setViewPageIndex(pageIndex0);
                setItems([]);
                setLoading(true);
                setError(null);
            });
            try {
                const { pageItems, resolvedTotal, hasMoreNext } = await loadPageFromApi(pageIndex0);
                if (id !== feedRequestId.current) return;
                setTotal(resolvedTotal);
                setItems(pageItems);
                setNextAppendPage0(pageIndex0 + 1);
                setHasMore(hasMoreNext);
            } catch (err) {
                if (id === feedRequestId.current) setError(err);
            } finally {
                if (id === feedRequestId.current) setLoading(false);
            }
        },
        [locationInitialized, loadPageFromApi]
    );

    const appendNextChunk = useCallback(async () => {
        if (!locationInitialized) return;
        if (!feedCanAppendMore(nextAppendPage0, total, BASE_ITEMS_PAGE_SIZE)) return;
        if (appendLock.current) return;
        appendLock.current = true;
        const id = ++feedRequestId.current;
        const pageToFetch = nextAppendPage0;
        flushSync(() => {
            setLoading(true);
            setError(null);
        });
        try {
            const { pageItems, resolvedTotal, hasMoreNext } = await loadPageFromApi(pageToFetch);
            if (id !== feedRequestId.current) return;
            setTotal(resolvedTotal);
            setItems((prev) => mergeFeedPageIntoItems(prev, pageItems));
            setNextAppendPage0((p) => p + 1);
            setHasMore(hasMoreNext);
        } catch (err) {
            if (id === feedRequestId.current) setError(err);
        } finally {
            appendLock.current = false;
            if (id === feedRequestId.current) setLoading(false);
        }
    }, [locationInitialized, loadPageFromApi, nextAppendPage0, total]);

    const goToPage1Based = useCallback(
        (page1Based) => {
            const p0 = page1Based - 1;
            if (p0 < 0) return;
            void replaceToPage0(p0);
        },
        [replaceToPage0]
    );

    const highlightPage1Based = useMemo(
        () => feedHighlightPage1Based(viewPageIndex, nextAppendPage0, total, BASE_ITEMS_PAGE_SIZE),
        [viewPageIndex, nextAppendPage0, total]
    );
    const canAppendMore = useMemo(
        () => feedCanAppendMore(nextAppendPage0, total, BASE_ITEMS_PAGE_SIZE),
        [nextAppendPage0, total]
    );

    const replaceToPage0Ref = useRef(replaceToPage0);
    replaceToPage0Ref.current = replaceToPage0;

    useLayoutEffect(() => {
        if (typeof window !== "undefined") {
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
                try {
                    const cached = JSON.parse(cachedRaw);
                    const cachedItems = Array.isArray(cached.items) ? cached.items : [];
                    const vp = Number(cached.viewPageIndex);
                    if (cachedItems.length > 0 && Number.isInteger(vp) && vp >= 0) {
                        const nap = Number(cached.nextAppendPage0);
                        const derivedNext =
                            Number.isInteger(nap) && nap >= 0
                                ? nap
                                : Math.max(vp + 1, Math.ceil(cachedItems.length / BASE_ITEMS_PAGE_SIZE));
                        setItems(cachedItems);
                        setTotal(Number(cached.total) || 0);
                        setViewPageIndex(vp);
                        setNextAppendPage0(derivedNext);
                        setHasMore(Boolean(cached.hasMoreNext));
                        setError(null);
                        return;
                    }
                } catch (_e) {}
            }
        }

        setItems([]);
        setTotal(0);
        setViewPageIndex(0);
        setNextAppendPage0(0);
        setHasMore(true);

        if (!locationInitialized) return;

        void replaceToPage0Ref.current(0);
    }, [cacheKey, locationInitialized]);

    useEffect(() => {
        persistFeedState();
    }, [persistFeedState]);

    const value = {
        pageState,
        updatePageState,
        handleLocationChange,
        locationInitialized,
        queryKey,
        items,
        total,
        loading,
        error,
        hasMore,
        goToPage1Based,
        appendNextChunk,
        highlightPage1Based,
        canAppendMore,
        persistFeedState,
        persistScrollState,
        isRestoring,
    };

    return (
        <BaseItemsInventoryLayoutContext.Provider value={value}>
            {children}
        </BaseItemsInventoryLayoutContext.Provider>
    );
}

export function useBaseItemsInventoryLayout() {
    const ctx = useContext(BaseItemsInventoryLayoutContext);
    if (!ctx) {
        throw new Error("useBaseItemsInventoryLayout must be used under the (inventory) layout");
    }
    return ctx;
}
