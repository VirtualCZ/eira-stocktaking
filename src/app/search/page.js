"use client";
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { usePageState } from "@/hooks/usePageState";
import Link from "next/link";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import { useRouter } from "next/navigation";
import HeadingCard from "@/components/molecules/HeadingCard";
import { ContextButton, ContextRow } from "@/components/molecules/ContextMenu";
import SortOptionsModal from "@/components/organisms/SortOptionsModal";
import CenteredModal from "@/components/molecules/CenteredModal";
import StocktakingItemCard from "@/components/organisms/StocktakingItemCard";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";
import Button from "@/components/atoms/Button";
import UserLocationPicker from "@/components/organisms/UserLocationPicker";
import { getAuthHeadersSafe } from "@/utils/token";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Popisek', value: 'description' },
];

export default function SearchPage() {
    const router = useRouter();
    const [location, setLocation] = useState(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("searchPage_location");
            return raw ? JSON.parse(raw) : null;
        } catch (_e) {
            return null;
        }
    });
    
    // Use page state for filters and sorting
    const [pageState, updatePageState, resetPageState] = usePageState('searchPage', {
        sortBy: "id",
        sortOrder: 'asc',
        viewMode: 'detailed',
        searchTerm: '',
        filterState: { state: [], hasNote: [] },
        currentPage: 0
    });

    // Create stable location values to prevent unnecessary useMemo recalculations
    const locationValues = useMemo(() => ({
        building: location?.building,
        storey: location?.storey,
        room: location?.room
    }), [location?.building, location?.storey, location?.room]);

    // Track if location has been initialized to prevent premature API calls
    const [locationInitialized, setLocationInitialized] = useState(() => location != null);

    // Stable location change handler
    const handleLocationChange = useCallback((newLocation) => {
        setLocation(newLocation);
        setLocationInitialized(true);
        if (typeof window !== "undefined") {
            try {
                if (newLocation) {
                    localStorage.setItem("searchPage_location", JSON.stringify(newLocation));
                } else {
                    localStorage.removeItem("searchPage_location");
                }
            } catch (_e) {}
        }
    }, []);

    // Mark location as initialized when it's first set
    useEffect(() => {
        if (location && !locationInitialized) {
            setLocationInitialized(true);
        }
    }, [location, locationInitialized]);

    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isNotInInventoryModalOpen, setIsNotInInventoryModalOpen] = useState(false);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: '', message: '', success: false });


    const queryKey = useMemo(() => JSON.stringify({
        sortBy: pageState.sortBy,
        sortOrder: pageState.sortOrder,
        searchTerm: pageState.searchTerm,
        room: locationValues.room,
        building: locationValues.building,
        storey: locationValues.storey
    }), [
        pageState.sortBy,
        pageState.sortOrder,
        pageState.searchTerm,
        locationValues.room,
        locationValues.building,
        locationValues.storey,
    ]);

    const cacheKey = useMemo(() => `searchFeedCache_${queryKey}`, [queryKey]);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastLoadedPage, setLastLoadedPage] = useState(-1);
    const [hasMore, setHasMore] = useState(true);
    const listSentinelRef = useRef(null);
    const requestedPagesRef = useRef(new Set());
    const pageCursorsRef = useRef(new Map([[0, null]]));
    const restoringScrollRef = useRef(false);
    const isHydratingRef = useRef(true);
    const pendingRestoreScrollYRef = useRef(null);

    const persistFeedState = useCallback(() => {
        if (typeof window === "undefined" || isHydratingRef.current) return;
        sessionStorage.setItem(cacheKey, JSON.stringify({
            items,
            total,
            lastLoadedPage,
            hasMore,
            loadedPages: Array.from(requestedPagesRef.current),
            pageCursors: Array.from(pageCursorsRef.current.entries()),
            scrollY: window.scrollY,
            ts: Date.now(),
        }));
    }, [cacheKey, items, total, lastLoadedPage, hasMore]);

    const restoreScrollWithRetry = useCallback((targetY) => {
        if (typeof window === "undefined" || typeof targetY !== "number") return;
        restoringScrollRef.current = true;
        let attempts = 0;
        const maxAttempts = 40;

        const tick = () => {
            window.scrollTo(0, targetY);
            const maxScrollableY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const reached = Math.abs(window.scrollY - Math.min(targetY, maxScrollableY)) <= 2;
            const enoughHeight = maxScrollableY >= targetY - 2;

            if (reached || (enoughHeight && attempts > 2) || attempts >= maxAttempts) {
                restoringScrollRef.current = false;
                isHydratingRef.current = false;
                pendingRestoreScrollYRef.current = null;
                return;
            }

            attempts += 1;
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }, []);

    const loadPage = useCallback(async (pageIndex, { replace = false } = {}) => {
        if (!locationInitialized) return;
        if (requestedPagesRef.current.has(pageIndex)) return;
        const cursor = pageCursorsRef.current.get(pageIndex);
        if (pageIndex > 0 && !cursor) return;
        requestedPagesRef.current.add(pageIndex);

        setLoading(true);
        setError(null);
        try {
            const body = {
                limit: PAGE_SIZE,
                sortBy: pageState.sortBy,
                sortOrder: pageState.sortOrder,
                search: pageState.searchTerm || "",
                roomId: locationValues.room,
                buildingId: locationValues.building,
                storeyId: locationValues.storey,
                noLocation: false
            };
            if (cursor?.id) {
                body.cursorId = cursor.id;
                body.cursorSortValue = cursor.sortValue ?? null;
            }

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
            const pageItems = data.items || [];
            const nextTotal = data.total || ((pageIndex * PAGE_SIZE) + pageItems.length + (data.hasMore ? 1 : 0));
            setTotal(nextTotal);
            setLastLoadedPage((prev) => Math.max(prev, pageIndex));
            let nextCount = 0;
            setItems((prev) => {
                if (replace) {
                    nextCount = pageItems.length;
                    return pageItems;
                }
                const seen = new Set(prev.map((i) => i.id));
                const appended = pageItems.filter((i) => !seen.has(i.id));
                const nextItems = [...prev, ...appended];
                nextCount = nextItems.length;
                return nextItems;
            });
            const nextCursor = data.nextCursorId
                ? { id: data.nextCursorId, sortValue: data.nextCursorSortValue ?? null }
                : null;
            pageCursorsRef.current.set(pageIndex + 1, nextCursor);
            setHasMore(Boolean(data.hasMore));
        } catch (err) {
            setError(err);
            requestedPagesRef.current.delete(pageIndex);
        } finally {
            setLoading(false);
        }
    }, [
        locationInitialized,
        pageState.sortBy,
        pageState.sortOrder,
        pageState.searchTerm,
        locationValues.room,
        locationValues.building,
        locationValues.storey,
    ]);


    const viewModes = [
        { mode: 'grid', icon: 'view_module' },
        { mode: 'detailed', icon: 'view_list' },
        { mode: 'compact', icon: 'view_agenda' }
    ];
    const currentViewIdx = viewModes.findIndex(vm => vm.mode === pageState.viewMode);
    const nextViewMode = () => {
        const newViewMode = viewModes[(currentViewIdx + 1) % viewModes.length].mode;
        updatePageState({ viewMode: newViewMode });
    };

    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);

    useLayoutEffect(() => {
        const updatePadding = () => {
            if (bottomBarRef.current) {
                setBottomPadding(bottomBarRef.current.offsetHeight);
            }
        };
        updatePadding();

        window.addEventListener("resize", updatePadding);
        return () => window.removeEventListener("resize", updatePadding);
    }, []);

    const showActionModal = (title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    };

    function handleScan(scannedValue) {
        // For now, just show the not in inventory modal since we don't have eventId context
        setIsQRModalOpen(false);
        setIsNotInInventoryModalOpen(true);
    }

    // Function to render item actions (context menu)
    const renderItemActions = (item) => (
        <ContextButton>
            <ContextRow
                icon="edit"
                label="Upravit"
                action={() => router.push(`/itemList/${item.id}?edit=1`)}
            />
            <ContextRow
                icon="visibility"
                label="Zobrazit detail"
                action={() => router.push(`/itemList/${item.id}`)}
            />
        </ContextButton>
    );



    // Reset list when search/sort/location query changes
    useEffect(() => {
        isHydratingRef.current = true;
        requestedPagesRef.current = new Set();
        pageCursorsRef.current = new Map([[0, null]]);
        setItems([]);
        setTotal(0);
        setLastLoadedPage(-1);
        setHasMore(true);

        if (typeof window !== "undefined") {
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
                try {
                    const cached = JSON.parse(cachedRaw);
                    setItems(cached.items || []);
                    setTotal(cached.total || 0);
                    setLastLoadedPage(cached.lastLoadedPage ?? -1);
                    setHasMore(cached.hasMore ?? true);
                    requestedPagesRef.current = new Set(
                        Array.isArray(cached.loadedPages) ? cached.loadedPages : []
                    );
                    pageCursorsRef.current = new Map(
                        Array.isArray(cached.pageCursors) ? cached.pageCursors : [[0, null]]
                    );
                    if (typeof cached.scrollY === "number") {
                        pendingRestoreScrollYRef.current = cached.scrollY;
                    } else {
                        isHydratingRef.current = false;
                    }
                    return;
                } catch (_e) {}
            }
        }

        if (locationInitialized) {
            loadPage(0, { replace: true });
        }
        isHydratingRef.current = false;
    }, [cacheKey, locationInitialized, loadPage]);

    useEffect(() => {
        if (pendingRestoreScrollYRef.current == null) return;
        // Trigger restore after list content has a chance to render.
        restoreScrollWithRetry(pendingRestoreScrollYRef.current);
    }, [items.length, restoreScrollWithRetry]);

    useEffect(() => {
        if (!locationInitialized || loading || !hasMore) return;
        if (items.length === 0 && lastLoadedPage < 0) return;
        const node = listSentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && !restoringScrollRef.current && !loading && hasMore) {
                        loadPage(lastLoadedPage + 1);
                        break;
                    }
                }
            },
            { rootMargin: "300px 0px" }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [items.length, hasMore, loading, lastLoadedPage, loadPage, locationInitialized]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const onScroll = () => persistFeedState();
        persistFeedState();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            persistFeedState();
            window.removeEventListener("scroll", onScroll);
        };
    }, [persistFeedState]);

    return (
        <main className="relative min-h-screen flex flex-col items-center">
            <div className="container" style={{ minHeight: "100vh", background: "#fff", display: "flex", padding: "1rem", paddingBottom: `calc(1rem + ${bottomPadding}px)`, flexDirection: "column", gap: "1rem" }}>
                <HeadingCard
                    heading="Vyhledávání položek"
                    leftActions={[
                        {
                            icon: "home", href: "/"
                        }
                    ]}
                    rightActions={[
                        {
                            icon: viewModes[currentViewIdx].icon,
                            onClick: nextViewMode,
                            title: 'Změnit zobrazení'
                        },
                        { icon: "sort", onClick: () => setIsOptionsModalOpen(true) },

                    ]}
                />

                {/* Location filter */}
                <UserLocationPicker onChange={handleLocationChange} />

                {error ? <div>Chyba: {error.message}</div> : null}
                <div className="flex flex-col gap-2">
                    {loading && items.length === 0 ? (
                        // Skeleton loading state
                        <>
                            {pageState.viewMode === 'grid' && (
                                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                                    {Array.from({ length: PAGE_SIZE }, (_, index) => (
                                        <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={false} />
                                    ))}
                                </div>
                            )}
                            {pageState.viewMode === 'detailed' && (
                                Array.from({ length: PAGE_SIZE }, (_, index) => (
                                    <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={false} />
                                ))
                            )}
                            {pageState.viewMode === 'compact' && (
                                Array.from({ length: PAGE_SIZE }, (_, index) => (
                                    <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={true} />
                                ))
                            )}
                        </>
                    ) : (
                        // Actual items
                        <>
                            {pageState.viewMode === 'grid' && (
                                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                                    {items.map(item => (
                                        <Link
                                            key={item.id}
                                            href={`/itemList/${item.id}`}
                                            scroll={false}
                                            onClick={persistFeedState}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <StocktakingItemCard
                                                item={item}
                                                renderActions={renderItemActions}
                                                compact={false}
                                                enableLazyImageFetch={true}
                                                showInventoryDetails={false}
                                                useStateColor={false}
                                            />
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {pageState.viewMode === 'detailed' && (
                                items.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/itemList/${item.id}`}
                                        scroll={false}
                                        onClick={persistFeedState}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <StocktakingItemCard
                                            item={item}
                                            renderActions={renderItemActions}
                                            compact={false}
                                            enableLazyImageFetch={true}
                                            showInventoryDetails={false}
                                            useStateColor={false}
                                        />
                                    </Link>
                                ))
                            )}

                            {pageState.viewMode === 'compact' && (
                                items.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/itemList/${item.id}`}
                                        scroll={false}
                                        onClick={persistFeedState}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <StocktakingItemCard
                                            item={item}
                                            renderActions={renderItemActions}
                                            compact={true}
                                            enableLazyImageFetch={true}
                                            showInventoryDetails={false}
                                            useStateColor={false}
                                        />
                                    </Link>
                                ))
                            )}
                        </>
                    )}
                </div>
                {loading && items.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "1rem", color: "#666" }}>
                        Načítám další položky...
                    </div>
                )}
                {!hasMore && items.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "1rem", color: "#666" }}>
                        Načteny všechny položky ({total})
                    </div>
                )}
                <div ref={listSentinelRef} style={{ height: 1 }} />
                {/* Fixed bottom bar with search and QR button */}
                <div
                    ref={bottomBarRef}
                    className="fixed left-0 right-0 bottom-0 z-[100] flex justify-center backdrop-blur-md"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.25) 100%)',
                    }}
                >
                    <div className="container flex items-center gap-2 p-4">
                        {/* Search input */}
                        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white">
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>search</span>
                            <input
                                type="text"
                                placeholder="Hledat..."
                                value={pageState.searchTerm}
                                onChange={(e) => updatePageState({ searchTerm: e.target.value })}
                                className="flex-1 bg-transparent border-none outline-none text-white h-4"
                                style={{ fontSize: "16px" }}
                            />
                        </div>

                        {/* QR Button */}
                        <button
                            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer"
                            onClick={() => setIsQRModalOpen(true)}
                        >
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>qr_code</span>
                        </button>
                    </div>
                </div>
                <SortOptionsModal
                    isOpen={isOptionsModalOpen}
                    onClose={() => setIsOptionsModalOpen(false)}
                    sortOptions={sortOptions}
                    initialSortBy={pageState.sortBy}
                    initialSortOrder={pageState.sortOrder}
                    onChange={({ sortBy: newSortBy, sortOrder: newSortOrder }) => {
                        updatePageState({ 
                            sortBy: newSortBy, 
                            sortOrder: newSortOrder, 
                            currentPage: 0 
                        });
                    }}
                />
                <QRScannerModal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    onScan={handleScan}
                    validate={false}
                />

                <CenteredModal isOpen={isNotInInventoryModalOpen} onClose={() => setIsNotInInventoryModalOpen(false)} title="QR Sken">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ color: "#FF6262", fontWeight: 600 }}>
                            Položka nebyla nalezena v databázi.
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            <Button icon="add" iconPosition="right" onClick={() => router.push("/newItem") }>
                                Založit novou položku
                            </Button>
                            <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsNotInInventoryModalOpen(false)}>
                                Storno
                            </Button>
                        </div>
                    </div>
                </CenteredModal>

                <CenteredModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={actionModalContent.title}>
                    <div style={{ color: actionModalContent.success ? '#2ecc40' : '#FF6262', fontWeight: 600, fontSize: 16 }}>
                        {actionModalContent.message}
                    </div>
                </CenteredModal>


            </div>
        </main>
    );
} 