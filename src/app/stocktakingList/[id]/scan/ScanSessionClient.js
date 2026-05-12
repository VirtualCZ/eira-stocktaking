"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUpdateInventoryObject, useInventoryObjectByQr } from "@/hooks/useStocktakingItems";
import { useStocktakingFeed } from "@/hooks/useStocktakingFeed";
import { useFeedScrollRestore } from "@/hooks/useFeedScrollRestore";
import { useGetLocation } from "@/hooks/useLocation";
import InlineQrScanner from "@/components/organisms/InlineQrScanner";
import HeadingCard from "@/components/molecules/HeadingCard";
import { ContextButton, ContextRow } from "@/components/molecules/ContextMenu";
import CenteredModal from "@/components/molecules/CenteredModal";
import LocationPicker from "@/components/organisms/LocationPicker";
import UserLocationPicker from "@/components/organisms/UserLocationPicker";
import CardItemName from "@/components/atoms/CardItemName";
import StocktakingItemCard from "@/components/organisms/StocktakingItemCard";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";
import StocktakingListItemViews from "../StocktakingListItemViews";
import Button from "@/components/atoms/Button";
import { Pagination } from "@/components/molecules/Pagination";
import { getAuthHeadersSafe } from "@/utils/token";
import { readScanListViewMode } from "@/utils/scanListViewMode";
import { INVENTORY_STATES, isFoundState, isMovedState, isNewState } from "@/utils/inventoryStates";

const SCAN_FEED_FILTER = { state: [], hasNote: [] };

const SCAN_NOTICE_DETAIL = "Na tomto místě je položka v inventuře už zahrnutá.";

function resolveImageSrc(image) {
    if (!image) return "/file.svg";
    if (/^data:image\//.test(image)) return image;
    if (/^[A-Za-z0-9+/=]+$/.test(image) && image.length > 100) return `data:image/*;base64,${image}`;
    return image;
}

export default function ScanSessionClient() {
    const params = useParams();
    const router = useRouter();
    const getLocation = useGetLocation();

    const stocktakingId = Number.parseInt(String(params?.id ?? ""), 10);
    const canFetch = Number.isFinite(stocktakingId) && stocktakingId > 0;

    const [feedLocation, setFeedLocation] = useState(() => getLocation());

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "selectedLocation") {
                setFeedLocation(getLocation());
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [getLocation]);

    const {
        items: feedItems,
        total: feedTotal,
        loading,
        error,
        goToPage1Based,
        appendNextChunk,
        loadMore,
        reset: resetFeed,
        pageSize,
        highlightPage1Based,
        canAppendMore,
    } = useStocktakingFeed({
        eventId: stocktakingId,
        sortBy: "lastCheck",
        sortOrder: "desc",
        searchTerm: "",
        filterState: SCAN_FEED_FILTER,
        location: feedLocation,
        enabled: canFetch,
    });

    const feedItemsRef = useRef(feedItems);
    feedItemsRef.current = feedItems;

    const [viewMode, setViewMode] = useState(() => readScanListViewMode());

    useEffect(() => {
        const sync = () => setViewMode(readScanListViewMode());
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("storage", sync);
        };
    }, []);
    const [scannerCollapsed, setScannerCollapsed] = useState(false);
    const [lastScannedItem, setLastScannedItem] = useState(null);
    const [scanPending, setScanPending] = useState(false);
    const [scannedQr, setScannedQr] = useState(null);
    const [apiItem, apiLoading, apiError, resolvedQr] = useInventoryObjectByQr(scannedQr, stocktakingId);

    const [isNotInInventoryModalOpen, setIsNotInInventoryModalOpen] = useState(false);
    const [notInInventoryItem, setNotInInventoryItem] = useState(null);
    const [isAddingScannedItem, setIsAddingScannedItem] = useState(false);
    const [isLookingUpOutsideInventory, setIsLookingUpOutsideInventory] = useState(false);

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: "", message: "", success: false });
    const [isUpdatingItem, setIsUpdatingItem] = useState(false);

    const [scanNotice, setScanNotice] = useState({ open: false, item: null });

    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveItem, setMoveItem] = useState(null);
    const [moveNewLocation, setMoveNewLocation] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [isScanUserLocationModalOpen, setIsScanUserLocationModalOpen] = useState(false);
    const [isScanUserLocationNestedOpen, setIsScanUserLocationNestedOpen] = useState(false);

    const { updateItem } = useUpdateInventoryObject(stocktakingId);

    const scanReturnTo = useMemo(() => `/stocktakingList/${stocktakingId}/scan`, [stocktakingId]);

    const scrollCacheKey = useMemo(() => {
        const r = feedLocation?.room ?? "";
        const s = feedLocation?.storey ?? "";
        const b = feedLocation?.building ?? "";
        return `stocktakingScanScroll_${stocktakingId}_${r}_${s}_${b}`;
    }, [stocktakingId, feedLocation?.room, feedLocation?.storey, feedLocation?.building]);
    const { persistScrollState, isRestoring } = useFeedScrollRestore({
        storageKey: scrollCacheKey,
        itemCount: feedItems.length,
        enabled: canFetch && scannerCollapsed,
    });

    const showActionModal = useCallback((title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    }, []);

    const closeScanNotice = useCallback(() => {
        setScanNotice({ open: false, item: null });
    }, []);

    const handleScan = useCallback((scannedValue) => {
        setLastScannedItem(null);
        setNotInInventoryItem(null);
        setIsLookingUpOutsideInventory(false);
        setIsNotInInventoryModalOpen(false);
        closeScanNotice();
        setScanPending(true);
        setScannedQr(scannedValue);
    }, [closeScanNotice]);

    const lookupItemOutsideCurrentEvent = useCallback(async (qrValue) => {
        setIsLookingUpOutsideInventory(true);
        setNotInInventoryItem(null);
        try {
            const response = await fetch("/api/objects/by-qr-any", {
                method: "POST",
                headers: getAuthHeadersSafe(),
                body: JSON.stringify({ qr: qrValue }),
            });
            if (!response.ok) {
                setNotInInventoryItem(null);
                return;
            }
            const data = await response.json();
            setNotInInventoryItem(data || null);
        } catch (_error) {
            setNotInInventoryItem(null);
        } finally {
            setIsLookingUpOutsideInventory(false);
        }
    }, []);

    const addScannedItemToCurrentInventory = useCallback(async () => {
        if (!notInInventoryItem?.id || !stocktakingId) return;

        setIsAddingScannedItem(true);
        try {
            const loc = getLocation();
            const body = {
                rmId: notInInventoryItem.id,
                eventId: stocktakingId,
                status: INVENTORY_STATES.UNCHECKED,
                note: notInInventoryItem.note || "",
                qr: notInInventoryItem.qr || "",
                location: loc || null,
            };

            const response = await fetch("/api/base-items/link-to-event", {
                method: "POST",
                headers: {
                    ...getAuthHeadersSafe(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const created = await response.json();
            setIsNotInInventoryModalOpen(false);
            setNotInInventoryItem(null);
            showActionModal("Hotovo", "Položka byla přidána do aktuální inventury.", true);
            resetFeed();
            await loadMore();

            if (created?.id) {
                router.push(
                    `/stocktakingList/${stocktakingId}/${created.id}?returnTo=${encodeURIComponent(scanReturnTo)}`
                );
            }
        } catch (_error) {
            showActionModal("Chyba", "Položku se nepodařilo přidat do inventury.", false);
        } finally {
            setIsAddingScannedItem(false);
        }
    }, [notInInventoryItem, stocktakingId, getLocation, showActionModal, resetFeed, loadMore, router, scanReturnTo]);

    useEffect(() => {
        if (!scannedQr) {
            return;
        }
        const normalizedScannedQr = String(scannedQr).trim();
        if (apiLoading) {
            return;
        }
        if (!apiItem && !apiError) {
            return;
        }
        if (resolvedQr !== normalizedScannedQr) {
            setScanPending(false);
            return;
        }

        setScannedQr(null);
        setScanPending(false);

        if (apiItem) {
            setLastScannedItem(apiItem);
            const loc = getLocation();
            const locationMismatch = Boolean(
                apiItem.location &&
                    loc?.room != null &&
                    loc.room !== "" &&
                    String(apiItem.location.room) !== String(loc.room)
            );
            if (locationMismatch) {
                setMoveItem(apiItem);
                setMoveNewLocation(loc);
                setIsMoveModalOpen(true);
            } else {
                const feedMatch = feedItemsRef.current.find((i) => Number(i.id) === Number(apiItem.id));
                const effectiveState = apiItem.state ?? feedMatch?.state;
                const noticeItem = {
                    ...apiItem,
                    state: effectiveState ?? apiItem.state,
                    image: apiItem.image ?? feedMatch?.image,
                    lastCheck: apiItem.lastCheck ?? feedMatch?.lastCheck,
                    note: apiItem.note ?? feedMatch?.note,
                    description: apiItem.description ?? feedMatch?.description,
                };
                if (isFoundState(effectiveState) || isMovedState(effectiveState) || isNewState(effectiveState)) {
                    setScanNotice({ open: true, item: noticeItem });
                }
            }
        } else {
            setIsNotInInventoryModalOpen(true);
            lookupItemOutsideCurrentEvent(normalizedScannedQr);
        }
    }, [apiItem, apiLoading, apiError, scannedQr, resolvedQr, getLocation, lookupItemOutsideCurrentEvent]);

    const renderItemActions = useCallback(
        (item) => (
            <ContextButton>
                <ContextRow
                    icon="edit"
                    label="Upravit"
                    action={() =>
                        router.push(
                            `/stocktakingList/${stocktakingId}/${item.id}?edit=1&returnTo=${encodeURIComponent(scanReturnTo)}`
                        )
                    }
                />
                <ContextRow
                    icon="swap_horiz"
                    label="Přesun"
                    action={() => {
                        setMoveItem(item);
                        setMoveNewLocation(item.location);
                        setIsMoveModalOpen(true);
                    }}
                />
                <ContextRow
                    icon={isFoundState(item.state) ? "visibility_off" : "visibility"}
                    label={isFoundState(item.state) ? "Nenalezeno" : "Nalezeno"}
                    action={async () => {
                        if (isFoundState(item.state)) {
                            setIsUpdatingItem(true);
                            try {
                                const { image, ...rest } = item;
                                const result = await updateItem({
                                    ...rest,
                                    stocktakingId,
                                    state: INVENTORY_STATES.NOT_FOUND,
                                });
                                if (result) {
                                    showActionModal("Hotovo", "Položka byla označena jako nenalezena.", true);
                                    resetFeed();
                                    loadMore();
                                } else {
                                    showActionModal("Chyba", "Nepodařilo se označit položku jako nenalezenou.", false);
                                }
                            } finally {
                                setIsUpdatingItem(false);
                            }
                        } else {
                            setIsUpdatingItem(true);
                            try {
                                const { image, ...rest } = item;
                                const result = await updateItem({
                                    ...rest,
                                    stocktakingId,
                                    state: INVENTORY_STATES.FOUND,
                                });
                                if (result) {
                                    showActionModal("Hotovo", "Položka byla označena jako nalezena.", true);
                                    resetFeed();
                                    loadMore();
                                } else {
                                    showActionModal("Chyba", "Nepodařilo se označit položku jako nalezenou.", false);
                                }
                            } finally {
                                setIsUpdatingItem(false);
                            }
                        }
                    }}
                />
            </ContextButton>
        ),
        [router, stocktakingId, updateItem, resetFeed, loadMore, showActionModal, scanReturnTo]
    );

    if (!canFetch) {
        return (
            <main className="relative min-h-screen flex flex-col items-center p-4">
                <div style={{ color: "#FF6262", fontWeight: 600 }}>Neplatná inventura (chybí nebo je neplatné ID).</div>
            </main>
        );
    }

    return (
        <main
            className="relative flex flex-col items-center"
            style={{ height: "100dvh", maxHeight: "100dvh", overflow: "hidden", background: "#fff" }}
        >
            <div
                className="container"
                style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    padding: "1rem",
                    paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                    gap: "0.75rem",
                }}
            >
                <HeadingCard
                    heading="Skener inventury"
                    leftActions={[{ icon: "home", href: "/" }]}
                    rightActions={[
                        {
                            icon: "place",
                            title: "Změnit umístění",
                            onClick: () => setIsScanUserLocationModalOpen(true),
                        },
                    ]}
                />

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                        width: "100%",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}
                    >
                        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                            <InlineQrScanner
                                active={canFetch}
                                onScan={handleScan}
                                validate={false}
                                wrapperStyle={{ flex: 1 }}
                            />
                        </div>
                        <div
                            style={{
                                borderRadius: 16,
                                background: "#f0f1f3",
                                padding: "0.65rem 0.75rem",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
                                {scanPending ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#535353", fontSize: 14 }}>
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
                                        Vyhledávám položku…
                                    </div>
                                ) : lastScannedItem ? (
                                    <div
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            minWidth: 0,
                                        }}
                                        title={lastScannedItem.name}
                                    >
                                        <CardItemName>{lastScannedItem.name}</CardItemName>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 13, color: "#888" }}>Naskenujte QR kód položky.</div>
                                )}
                            </div>
                            <button
                                type="button"
                                aria-label="Zobrazit seznam"
                                onClick={() => setScannerCollapsed(true)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                    padding: "8px 14px",
                                    borderRadius: 999,
                                    border: "1px solid #e0e0e0",
                                    background: "#fff",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    color: "#282828",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    flexShrink: 0,
                                }}
                            >
                                <span className="material-icons-round" style={{ fontSize: 20 }}>
                                    expand_less
                                </span>
                                Seznam
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                aria-label="Zavřít seznam"
                onClick={() => setScannerCollapsed(false)}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 200,
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: scannerCollapsed ? "pointer" : "default",
                    background: "rgba(0, 0, 0, 0.42)",
                    WebkitTapHighlightColor: "transparent",
                    opacity: scannerCollapsed ? 1 : 0,
                    pointerEvents: scannerCollapsed ? "auto" : "none",
                    transition: "opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
            />

            <div
                style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 210,
                    width: "100%",
                    maxHeight: "min(92dvh, calc(100dvh - env(safe-area-inset-top) - 8px))",
                    display: "flex",
                    flexDirection: "column",
                    background: "#fff",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    boxShadow: "0 -12px 48px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    transform: scannerCollapsed ? "translate3d(0, 0, 0)" : "translate3d(0, calc(100% + 20px), 0)",
                    transition: "transform 0.52s cubic-bezier(0.32, 0.72, 0, 1)",
                    pointerEvents: scannerCollapsed ? "auto" : "none",
                }}
            >
                <button
                    type="button"
                    onClick={() => setScannerCollapsed(false)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 16px",
                        margin: "12px 16px 8px",
                        borderRadius: 14,
                        background: "#f2f2f7",
                        color: "#1c1c1e",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                        flexShrink: 0,
                        alignSelf: "stretch",
                    }}
                >
                    <span className="material-icons-round" style={{ fontSize: 20 }}>
                        close
                    </span>
                    Zavřít seznam
                </button>
                {error ? (
                    <div style={{ padding: "0 16px", color: "#c00" }}>
                        Chyba: {error.message}
                    </div>
                ) : null}
                <div
                    style={{
                        flex: 1,
                        overflow: "auto",
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: "0 16px max(12px, env(safe-area-inset-bottom))",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {isRestoring && feedItems.length > 0 ? (
                        Array.from({ length: 8 }, (_, index) => (
                            <StocktakingItemCardSkeleton
                                key={`restore-skeleton-${index}`}
                                compact={viewMode === "compact"}
                            />
                        ))
                    ) : (
                        <StocktakingListItemViews
                            viewMode={viewMode}
                            loading={loading && feedItems.length === 0}
                            appendLoading={loading && feedItems.length > 0}
                            items={feedItems}
                            stocktakingId={stocktakingId}
                            pageSize={pageSize}
                            renderItemActions={renderItemActions}
                            onItemNavigate={(itemId) => persistScrollState({ anchorId: itemId })}
                            itemDetailReturnTo={scanReturnTo}
                        />
                    )}
                    <Pagination
                        variant="feed"
                        total={feedTotal}
                        pageSize={pageSize}
                        highlightPage1Based={highlightPage1Based}
                        loading={loading}
                        onPageSelect1Based={goToPage1Based}
                        onAppendNext={appendNextChunk}
                        canAppendMore={canAppendMore}
                        appendNextLabel={`Načíst dalších ${pageSize}`}
                    />
                </div>
            </div>

                <CenteredModal
                    isOpen={isScanUserLocationModalOpen}
                    onClose={() => {
                        setIsScanUserLocationNestedOpen(false);
                        setIsScanUserLocationModalOpen(false);
                    }}
                    title="Aktuální umístění"
                    disableClickAway={isScanUserLocationNestedOpen}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <UserLocationPicker
                            onChange={(loc) => setFeedLocation(loc)}
                            onModalOpen={() => setIsScanUserLocationNestedOpen(true)}
                            onModalClose={() => setIsScanUserLocationNestedOpen(false)}
                        />
                        <Button
                            variant="secondary"
                            icon="close"
                            iconPosition="right"
                            onClick={() => {
                                setIsScanUserLocationNestedOpen(false);
                                setIsScanUserLocationModalOpen(false);
                            }}
                        >
                            Zavřít
                        </Button>
                    </div>
                </CenteredModal>

                <CenteredModal isOpen={isNotInInventoryModalOpen} onClose={() => setIsNotInInventoryModalOpen(false)} title="QR Sken">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ color: "#FF6262", fontWeight: 600 }}>
                            Položka není součástí inventurního seznamu.
                        </div>
                        {isLookingUpOutsideInventory && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "0.5rem 0" }}>
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                                <div style={{ fontSize: 13, color: "#535353" }}>Vyhledávám položku podle QR...</div>
                            </div>
                        )}
                        {!isLookingUpOutsideInventory && notInInventoryItem && (
                            <div
                                style={{
                                    borderRadius: 16,
                                    background: "#f0f1f3",
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                }}
                            >
                                <img
                                    src={resolveImageSrc(notInInventoryItem.image)}
                                    alt={notInInventoryItem.name}
                                    style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                                />
                                <div className="p-4 gap-2 flex flex-col">
                                    <CardItemName>{notInInventoryItem.name}</CardItemName>
                                    <div style={{ fontSize: 12, color: "#535353" }}>{notInInventoryItem.note}</div>
                                    {notInInventoryItem.qr && (
                                        <div style={{ fontSize: 12, color: "#535353", fontStyle: "italic" }}>
                                            QR kód: {notInInventoryItem.qr}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            {!isLookingUpOutsideInventory && notInInventoryItem && (
                                <Button icon="playlist_add" iconPosition="right" onClick={addScannedItemToCurrentInventory}>
                                    {isAddingScannedItem ? "Přidávám..." : "Přidat tuto položku do inventury"}
                                </Button>
                            )}
                            {!isLookingUpOutsideInventory && !notInInventoryItem && (
                                <Button icon="add" iconPosition="right" onClick={() => router.push("/newItem")}>
                                    Založit novou položku
                                </Button>
                            )}
                            <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsNotInInventoryModalOpen(false)}>
                                Storno
                            </Button>
                        </div>
                    </div>
                </CenteredModal>

                <CenteredModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} title="Přesun položky" disableClickAway={isLocationPickerOpen}>
                    {moveItem && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ color: "#0074D9", fontWeight: 600 }}>Položka bude přesunuta do jiné místnosti</div>
                            <div
                                style={{
                                    borderRadius: 16,
                                    background: "#f0f1f3",
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                }}
                            >
                                {moveItem.image && (
                                    <img
                                        src={resolveImageSrc(moveItem.image)}
                                        alt={moveItem.name}
                                        style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                                    />
                                )}
                                <div className="p-4 gap-4 flex flex-col">
                                    <div>
                                        <CardItemName>{moveItem.name}</CardItemName>
                                        <div style={{ fontSize: 12, color: "#535353" }}>{moveItem.note}</div>
                                    </div>
                                    <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                        Poslední kontrola {moveItem.lastCheck ? new Date(moveItem.lastCheck).toLocaleString() : ""}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
                                <LocationPicker value={moveItem.location} label="Aktuální umístění:" editMode={false} />
                                <span className="material-icons-round" style={{ fontSize: 24, color: "#000" }}>
                                    arrow_downward
                                </span>
                                <LocationPicker
                                    value={moveNewLocation}
                                    label="Nové umístění:"
                                    editMode={true}
                                    onChange={setMoveNewLocation}
                                    onModalOpen={() => setIsLocationPickerOpen(true)}
                                    onModalClose={() => setIsLocationPickerOpen(false)}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                <Button
                                    icon="check"
                                    iconPosition="right"
                                    onClick={async () => {
                                        if (!moveNewLocation) return;
                                        const { image, ...rest } = moveItem;
                                        const result = await updateItem({
                                            ...rest,
                                            stocktakingId,
                                            location: moveNewLocation,
                                            state: INVENTORY_STATES.MOVED,
                                        });
                                        setIsMoveModalOpen(false);
                                        setMoveItem(null);
                                        setMoveNewLocation(null);
                                        if (result) {
                                            showActionModal("Hotovo", "Položka byla úspěšně přesunuta.", true);
                                            resetFeed();
                                            loadMore();
                                        } else {
                                            showActionModal("Chyba", "Položku se nepodařilo přesunout.", false);
                                        }
                                    }}
                                >
                                    Potvrdit změnu lokace
                                </Button>
                                <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsMoveModalOpen(false)}>
                                    Storno
                                </Button>
                            </div>
                        </div>
                    )}
                </CenteredModal>

                <CenteredModal isOpen={scanNotice.open} onClose={closeScanNotice} title="QR Sken">
                    {scanNotice.item ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    lineHeight: 1.45,
                                    color: "#535353",
                                }}
                            >
                                {SCAN_NOTICE_DETAIL}
                            </p>
                            <div style={{ width: "100%", minWidth: 0 }}>
                                <StocktakingItemCard
                                    item={scanNotice.item}
                                    compact={false}
                                    enableLazyImageFetch={true}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                <Button
                                    icon="edit"
                                    iconPosition="right"
                                    onClick={() => {
                                        const id = scanNotice.item?.id;
                                        closeScanNotice();
                                        if (id) {
                                            router.push(
                                                `/stocktakingList/${stocktakingId}/${id}?edit=1&returnTo=${encodeURIComponent(scanReturnTo)}`
                                            );
                                        }
                                    }}
                                >
                                    Upravit
                                </Button>
                                <Button variant="secondary" icon="close" iconPosition="right" onClick={closeScanNotice}>
                                    Storno
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CenteredModal>

                <CenteredModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={actionModalContent.title}>
                    <div style={{ color: actionModalContent.success ? "#2ecc40" : "#FF6262", fontWeight: 600, fontSize: 16 }}>
                        {actionModalContent.message}
                    </div>
                </CenteredModal>

                <CenteredModal isOpen={isUpdatingItem} title="Probíhá akce...">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <span>Probíhá akce...</span>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
                    </div>
                </CenteredModal>
        </main>
    );
}
