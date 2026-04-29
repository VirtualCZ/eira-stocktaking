"use client";
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { useUpdateInventoryObject, useInventoryObjectByQr } from "@/hooks/useStocktakingItems";
import { useStocktakingListLayout } from "@/contexts/StocktakingListLayoutContext";
import { useFeedScrollRestore } from "@/hooks/useFeedScrollRestore";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import { useRouter } from "next/navigation";
import HeadingCard from "@/components/molecules/HeadingCard";
import { ContextButton, ContextRow } from "@/components/molecules/ContextMenu";
import SortOptionsModal from "@/components/organisms/SortOptionsModal";
import CenteredModal from "@/components/molecules/CenteredModal";
import LocationPicker from "@/components/organisms/LocationPicker";
import UserLocationPicker from "@/components/organisms/UserLocationPicker";
import CardItemName from "@/components/atoms/CardItemName";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";
import StocktakingListItemViews from "./StocktakingListItemViews";
import FilterOptionsModal from "@/components/organisms/FilterOptionsModal";
import StatusSelectionModal from "@/components/organisms/StatusSelectionModal";
import Button from "@/components/atoms/Button";
import { Pagination } from "@/components/molecules/Pagination";
import { useSettings } from "@/hooks/useSettings";
import { getAuthHeadersSafe } from "@/utils/token";
import { INVENTORY_STATES, isFoundState } from "@/utils/inventoryStates";


const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka k inventuře', value: 'note' },
];

const viewModes = [
    { mode: 'grid', icon: 'view_module' },
    { mode: 'detailed', icon: 'view_list' },
    { mode: 'compact', icon: 'view_agenda' }
];

export default function StocktakingList() {

    const router = useRouter();
    const { recordStatus } = useSettings();

    const {
        stocktakingId,
        canFetch,
        pageState,
        updatePageState,
        location,
        setLocation,
        handleLocationChange,
        hasLocationFilter,
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
    } = useStocktakingListLayout();

    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isNotInInventoryModalOpen, setIsNotInInventoryModalOpen] = useState(false);
    const [notInInventoryItem, setNotInInventoryItem] = useState(null);
    const [isAddingScannedItem, setIsAddingScannedItem] = useState(false);
    const [isLookingUpOutsideInventory, setIsLookingUpOutsideInventory] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: '', message: '', success: false });
    const [isStatusSelectionModalOpen, setIsStatusSelectionModalOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState(null);
    const [isUpdatingItem, setIsUpdatingItem] = useState(false);

    const { updateItem } = useUpdateInventoryObject(stocktakingId);

    const [scannedQr, setScannedQr] = useState(null);
    const [apiItem, apiLoading, apiError, resolvedQr] = useInventoryObjectByQr(scannedQr, stocktakingId);

    const currentViewIdx = viewModes.findIndex(vm => vm.mode === pageState.viewMode);
    const nextViewMode = () => {
        const newViewMode = viewModes[(currentViewIdx + 1) % viewModes.length].mode;
        updatePageState({ viewMode: newViewMode });
    };

    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);

    // Add state for the move modal and selected item/location
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveItem, setMoveItem] = useState(null);
    const [moveNewLocation, setMoveNewLocation] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

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

    const showActionModal = useCallback((title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    }, []);

    const scrollCacheKey = useMemo(
        () => `stocktakingListScroll_${stocktakingId}`,
        [stocktakingId]
    );

    const { persistScrollState, isRestoring } = useFeedScrollRestore({
        storageKey: scrollCacheKey,
        itemCount: feedItems.length,
        enabled: canFetch
    });

    // Helper function to append status to note
    const appendStatusToNote = useCallback((existingNote, status) => {
        const statusText = status.label;
        if (!existingNote) {
            return `Stav: ${statusText}`;
        }
        return `${existingNote} | Stav: ${statusText}`;
    }, []);

    // Handle status selection from modal
    const handleStatusSelect = useCallback(
        async (status) => {
            if (!pendingItem) return;

            setIsUpdatingItem(true);
            try {
                const { image, ...rest } = pendingItem;
                const updatedNote = appendStatusToNote(rest.note, status);

                const result = await updateItem({
                    ...rest,
                    stocktakingId: stocktakingId,
                    state: INVENTORY_STATES.FOUND,
                    note: updatedNote
                });

                setIsPreviewModalOpen(false);
                setPendingItem(null);

                if (result) {
                    showActionModal('Hotovo', 'Položka byla označena jako nalezená.', true);
                    resetFeed();
                    await loadMore();
                } else {
                    showActionModal('Chyba', 'Položku se nepodařilo označit jako nalezenou.', false);
                }
            } finally {
                setIsUpdatingItem(false);
            }
        },
        [pendingItem, appendStatusToNote, updateItem, stocktakingId, showActionModal, resetFeed, loadMore]
    );

    const handleScan = useCallback((scannedValue) => {
        setIsQRModalOpen(false);
        setScannedItem(null);
        setNotInInventoryItem(null);
        setIsLookingUpOutsideInventory(false);
        setIsPreviewModalOpen(true);
        setIsNotInInventoryModalOpen(false);
        setScannedQr(scannedValue);
    }, []);

    const lookupItemOutsideCurrentEvent = useCallback(async (qrValue) => {
        setIsLookingUpOutsideInventory(true);
        setNotInInventoryItem(null);
        try {
            const response = await fetch('/api/objects/by-qr-any', {
                method: 'POST',
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
            const body = {
                rmId: notInInventoryItem.id,
                eventId: stocktakingId,
                status: INVENTORY_STATES.UNCHECKED,
                note: notInInventoryItem.note || "",
                qr: notInInventoryItem.qr || "",
                location: location || null,
            };

            const response = await fetch('/api/base-items/link-to-event', {
                method: 'POST',
                headers: {
                    ...getAuthHeadersSafe(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const created = await response.json();
            setIsNotInInventoryModalOpen(false);
            setNotInInventoryItem(null);
            showActionModal('Hotovo', 'Položka byla přidána do aktuální inventury.', true);
            resetFeed();
            await loadMore();

            if (created?.id) {
                router.push(`/stocktakingList/${stocktakingId}/${created.id}`);
            }
        } catch (_error) {
            showActionModal('Chyba', 'Položku se nepodařilo přidat do inventury.', false);
        } finally {
            setIsAddingScannedItem(false);
        }
    }, [notInInventoryItem, stocktakingId, location, showActionModal, resetFeed, loadMore, router]);

    useEffect(() => {
        if (!scannedQr) {
            return;
        }
        const normalizedScannedQr = String(scannedQr).trim();
        if (apiLoading) {
            return;
        }
        // Wait until /by-qr produced an actual outcome.
        // Without this, we can incorrectly fall back to /by-qr-any
        // before the primary request has resolved.
        if (!apiItem && !apiError) {
            return;
        }
        // Ignore stale result from a previous scan.
        if (resolvedQr !== normalizedScannedQr) {
            return;
        }

        setScannedQr(null);

        if (apiItem) {
            setScannedItem(apiItem);

            if (apiItem.location && location && apiItem.location.room !== location.room) {
                setMoveItem(apiItem);
                setMoveNewLocation(location);
                setIsMoveModalOpen(true);
                setIsPreviewModalOpen(false);
            }
        } else {
            setIsPreviewModalOpen(false);
            setIsNotInInventoryModalOpen(true);
            lookupItemOutsideCurrentEvent(scannedQr);
        }
    }, [apiItem, apiLoading, apiError, scannedQr, resolvedQr, location, lookupItemOutsideCurrentEvent]);

    // Function to render item actions (context menu)
    const renderItemActions = useCallback(
        (item) => (
            <ContextButton>
                <ContextRow
                    icon="edit"
                    label="Upravit"
                    action={() => router.push(`/stocktakingList/${stocktakingId}/${item.id}?edit=1`)}
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
                    icon={isFoundState(item.state) ? 'visibility_off' : 'visibility'}
                    label={isFoundState(item.state) ? 'Nenalezeno' : 'Nalezeno'}
                    action={async () => {
                        if (isFoundState(item.state)) {
                            setIsUpdatingItem(true);
                            try {
                                const { image, ...rest } = item;
                                const result = await updateItem({ ...rest, stocktakingId: stocktakingId, state: INVENTORY_STATES.NOT_FOUND });
                                if (result) {
                                    showActionModal('Hotovo', 'Položka byla označena jako nenalezena.', true);
                                    resetFeed();
                                    loadMore();
                                } else {
                                    showActionModal('Chyba', 'Nepodařilo se označit položku jako nenalezenou.', false);
                                }
                            } finally {
                                setIsUpdatingItem(false);
                            }
                        } else if (recordStatus) {
                            setPendingItem(item);
                            setIsStatusSelectionModalOpen(true);
                        } else {
                            setIsUpdatingItem(true);
                            try {
                                const { image, ...rest } = item;
                            const result = await updateItem({ ...rest, stocktakingId: stocktakingId, state: INVENTORY_STATES.FOUND });
                                if (result) {
                                    showActionModal('Hotovo', 'Položka byla označena jako nalezena.', true);
                                    resetFeed();
                                    loadMore();
                                } else {
                                    showActionModal('Chyba', 'Nepodařilo se označit položku jako nalezenou.', false);
                                }
                            } finally {
                                setIsUpdatingItem(false);
                            }
                        }
                    }}
                />
            </ContextButton>
        ),
        [router, stocktakingId, updateItem, resetFeed, loadMore, showActionModal, recordStatus]
    );

    if (!canFetch) {
        return (
            <main className="relative min-h-screen flex flex-col items-center p-4">
                <div style={{ color: '#FF6262', fontWeight: 600 }}>Neplatná inventura (chybí nebo je neplatné ID).</div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen flex flex-col items-center">
            <div className="container" style={{ minHeight: "100vh", background: "#fff", display: "flex", padding: "1rem", paddingBottom: `calc(1rem + ${bottomPadding}px)`, flexDirection: "column", gap: "1rem" }}>
                <HeadingCard
                    heading="Seznam předmětů"
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
                        { icon: "filter_alt", onClick: () => setIsFilterModalOpen(true) },
                    ]}
                />

                <UserLocationPicker onChange={handleLocationChange} />

                {error ? <div>Chyba: {error.message}</div> : null}
                <div className="flex flex-col gap-2">
                    {isRestoring && feedItems.length > 0 ? (
                        Array.from({ length: 8 }, (_, index) => (
                            <StocktakingItemCardSkeleton
                                key={`restore-skeleton-${index}`}
                                compact={pageState.viewMode === "compact"}
                            />
                        ))
                    ) : (
                        <StocktakingListItemViews
                            viewMode={pageState.viewMode}
                            loading={loading && feedItems.length === 0}
                            appendLoading={loading && feedItems.length > 0}
                            items={feedItems}
                            stocktakingId={stocktakingId}
                            pageSize={pageSize}
                            renderItemActions={renderItemActions}
                            onItemNavigate={(itemId) => persistScrollState({ anchorId: itemId })}
                        />
                    )}
                </div>
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
                            sortOrder: newSortOrder
                        });
                    }}
                />
                <FilterOptionsModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    initialState={pageState.filterState.state}
                    initialHasNote={pageState.filterState.hasNote}
                    onChange={({ state, hasNote }) => {
                        updatePageState({ 
                            filterState: { state, hasNote }
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
                            Položka není součástí inventurního seznamu.
                        </div>
                        {isLookingUpOutsideInventory && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "0.5rem 0" }}>
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                <div style={{ fontSize: 13, color: "#535353" }}>Vyhledávám položku podle QR...</div>
                            </div>
                        )}
                        {!isLookingUpOutsideInventory && notInInventoryItem && (
                            <div style={{
                                borderRadius: 16,
                                background: "#f0f1f3",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                width: "100%"
                            }}>
                                <img
                                    src={
                                        notInInventoryItem.image
                                            ? (/^data:image\//.test(notInInventoryItem.image)
                                                ? notInInventoryItem.image
                                                : (/^[A-Za-z0-9+/=]+$/.test(notInInventoryItem.image) && notInInventoryItem.image.length > 100)
                                                    ? `data:image/*;base64,${notInInventoryItem.image}`
                                                    : notInInventoryItem.image)
                                            : "/file.svg"
                                    }
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
                                <Button icon="add" iconPosition="right" onClick={() => router.push("/newItem") }>
                                    Založit novou položku
                                </Button>
                            )}
                            <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsNotInInventoryModalOpen(false)}>
                                Storno
                            </Button>
                        </div>
                    </div>
                </CenteredModal>
                <CenteredModal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    title="Náhled naskenované položky"
                >
                    {apiLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Skeleton for image */}
                            <div style={{
                                borderRadius: 16,
                                background: "#f0f1f3",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                width: "100%"
                            }}>
                                <div style={{ 
                                    width: "100%", 
                                    height: 150, 
                                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                                    backgroundSize: "200% 100%",
                                    animation: "loading 1.5s infinite"
                                }} />
                                <div className="p-4 gap-4 flex flex-col">
                                    {/* Skeleton for name */}
                                    <div style={{ 
                                        height: 24, 
                                        width: "70%", 
                                        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                                        backgroundSize: "200% 100%",
                                        animation: "loading 1.5s infinite",
                                        borderRadius: 4
                                    }} />
                                    {/* Skeleton for note */}
                                    <div style={{ 
                                        height: 16, 
                                        width: "90%", 
                                        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                                        backgroundSize: "200% 100%",
                                        animation: "loading 1.5s infinite",
                                        borderRadius: 4
                                    }} />
                                </div>
                            </div>
                            {/* Skeleton for buttons */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                <div style={{ 
                                    height: 48, 
                                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                                    backgroundSize: "200% 100%",
                                    animation: "loading 1.5s infinite",
                                    borderRadius: 8
                                }} />
                                <div style={{ 
                                    height: 48, 
                                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                                    backgroundSize: "200% 100%",
                                    animation: "loading 1.5s infinite",
                                    borderRadius: 8
                                }} />
                                <div style={{ 
                                    height: 48, 
                                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                                    backgroundSize: "200% 100%",
                                    animation: "loading 1.5s infinite",
                                    borderRadius: 8
                                }} />
                            </div>
                        </div>
                    ) : scannedItem ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{
                                borderRadius: 16,
                                background: "#f0f1f3",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                width: "100%"
                            }}>
                                {/* Top: Image */}
                                <img
                                    src={
                                        scannedItem.image
                                            ? (/^data:image\//.test(scannedItem.image)
                                                ? scannedItem.image
                                                : (/^[A-Za-z0-9+/=]+$/.test(scannedItem.image) && scannedItem.image.length > 100)
                                                    ? `data:image/*;base64,${scannedItem.image}`
                                                    : scannedItem.image)
                                            : "/file.svg"
                                    }
                                    alt={scannedItem.name}
                                    style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                                />
                                {/* Bottom: Content */}
                                <div className="p-4 gap-4 flex flex-col">
                                    <div>
                                        <CardItemName>{scannedItem.name}</CardItemName>
                                        <div style={{ fontSize: 12, color: "#535353" }}>{scannedItem.note}</div>
                                    </div>
                                    <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                        {scannedItem.qr && (<span>QR kód: {scannedItem.qr}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                <Button icon="check" iconPosition="right" onClick={async () => {
                                    if (!scannedItem || !scannedItem.id) return;
                                    
                                    if (recordStatus) {
                                        // Show status selection modal
                                        setPendingItem(scannedItem);
                                        setIsStatusSelectionModalOpen(true);
                                    } else {
                                        // Direct confirmation without status selection
                                        setIsUpdatingItem(true);
                                        try {
                                            const { image, ...rest } = scannedItem;
                                            const result = await updateItem({ ...rest, stocktakingId: stocktakingId, state: INVENTORY_STATES.FOUND });
                                            setIsPreviewModalOpen(false);
                                            if (result) {
                                                showActionModal('Hotovo', 'Položka byla označena jako nalezená.', true);
                                    resetFeed();
                                    loadMore();
                                            } else {
                                                showActionModal('Chyba', 'Položku se nepodařilo označit jako nalezenou.', false);
                                            }
                                        } finally {
                                            setIsUpdatingItem(false);
                                        }
                                    }
                                }}>
                                    Označit jako nalezeno
                                </Button>
                                <Button icon="edit" iconPosition="right" onClick={() => {
                                    if (scannedItem && scannedItem.id) {
                                        router.push(`/stocktakingList/${stocktakingId}/${scannedItem.id}`);
                                    }
                                }}>
                                    Upravit položku
                                </Button>
                                <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsPreviewModalOpen(false)}>
                                    Storno
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CenteredModal>
                <CenteredModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} title="Přesun položky" disableClickAway={isLocationPickerOpen}>
                  {moveItem && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ color: "#0074D9", fontWeight: 600 }}>
                        Položka bude přesunuta do jiné místnosti
                      </div>
                      <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "hidden", display: "flex", flexDirection: "column", width: "100%" }}>
                        {/* Top: Image */}
                        {moveItem.image && (
                          <img
                            src={
                              /^data:image\//.test(moveItem.image)
                                ? moveItem.image
                                : (/^[A-Za-z0-9+/=]+$/.test(moveItem.image) && moveItem.image.length > 100)
                                  ? `data:image/*;base64,${moveItem.image}`
                                  : moveItem.image
                            }
                            alt={moveItem.name}
                            style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                          />
                        )}
                        {/* Bottom: Content */}
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
                        <span className="material-icons-round" style={{ fontSize: 24, color: "#000" }}>arrow_downward</span>
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
                        <Button icon="check" iconPosition="right" onClick={async () => {
                          if (!moveNewLocation) return;
                          const { image, ...rest } = moveItem;
                          const result = await updateItem({ ...rest, stocktakingId: stocktakingId, location: moveNewLocation, state: INVENTORY_STATES.MOVED });
                          setIsMoveModalOpen(false);
                          setMoveItem(null);
                          setMoveNewLocation(null);
                          if (result) {
                            showActionModal('Hotovo', 'Položka byla úspěšně přesunuta.', true);
                            resetFeed();
                            loadMore();
                          } else {
                            showActionModal('Chyba', 'Položku se nepodařilo přesunout.', false);
                          }
                        }}>
                          Potvrdit změnu lokace
                        </Button>
                        <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsMoveModalOpen(false)}>
                          Storno
                        </Button>
                      </div>
                    </div>
                  )}
                </CenteredModal>

                <CenteredModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={actionModalContent.title}>
                    <div style={{ color: actionModalContent.success ? '#2ecc40' : '#FF6262', fontWeight: 600, fontSize: 16 }}>
                        {actionModalContent.message}
                    </div>
                </CenteredModal>

                <StatusSelectionModal
                    isOpen={isStatusSelectionModalOpen}
                    onClose={() => {
                        setIsStatusSelectionModalOpen(false);
                        setPendingItem(null);
                    }}
                    onStatusSelect={handleStatusSelect}
                    itemName={pendingItem?.name || ''}
                />

                {/* Loading modal for item updates */}
                <CenteredModal isOpen={isUpdatingItem} title="Probíhá akce...">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <span>Probíhá akce...</span>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                </CenteredModal>
            </div>
        </main>
    );
}