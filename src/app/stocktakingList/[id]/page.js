"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useStocktakingItems, useUpdateStocktakingItem, useStocktakingItemByQr } from "@/hooks/useStocktakingItems";
import { usePageState } from "@/hooks/usePageState";
import Link from "next/link";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import { useRouter, useParams } from "next/navigation";
import HeadingCard from "@/components/molecules/HeadingCard";
import { ContextButton, ContextRow } from "@/components/molecules/ContextMenu";
import { Pagination } from "@/components/molecules/Pagination";
import SortOptionsModal from "@/components/organisms/SortOptionsModal";
import CenteredModal from "@/components/molecules/CenteredModal";
import LocationPicker from "@/components/organisms/LocationPicker";
import UserLocationPicker from "@/components/organisms/UserLocationPicker";
import CardItemName from "@/components/atoms/CardItemName";
import StocktakingItemCard from "@/components/organisms/StocktakingItemCard";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";
import FilterOptionsModal from "@/components/organisms/FilterOptionsModal";
import Button from "@/components/atoms/Button";


const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka k inventuře', value: 'note' },
];

export default function StocktakingList() {

    const router = useRouter();
    const params = useParams();
    const stocktakingId = parseInt(params.id);
    
    // Use page state for filters and sorting
    const [pageState, updatePageState, resetPageState] = usePageState(`stocktakingList_${stocktakingId}`, {
        sortBy: "id",
        sortOrder: 'asc',
        viewMode: 'detailed',
        searchTerm: '',
        filterState: { state: [], hasNote: [] },
        currentPage: 0
    });

    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isNotInInventoryModalOpen, setIsNotInInventoryModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: '', message: '', success: false });

    const [location, setLocation] = useState(null);
    const canFetch = location && (location.building || location.storey || location.room);

    const [items, total, loading, error, refetchItems, refetchWithImages, hasImagesForCurrentPage] = useStocktakingItems(
        canFetch
            ? {
                offset: pageState.currentPage * PAGE_SIZE,
                limit: PAGE_SIZE,
                sortBy: pageState.sortBy,
                sortOrder: pageState.sortOrder,
                search: pageState.searchTerm,
                state: pageState.filterState.state,
                hasNote: pageState.filterState.hasNote,
                roomId: location.room,
                buildingId: location.building,
                storeyId: location.storey,
                noLocation: !location.building && !location.storey && !location.room,
                eventId: stocktakingId,
                includeImages: pageState.viewMode !== 'compact', // Start with current view mode preference
            }
            : { skip: true }
    );

    const { updateItem, loading: updating, error: updateError, success: updateSuccess } = useUpdateStocktakingItem(stocktakingId);

    const [scannedQr, setScannedQr] = useState(null);
    const [apiItem, apiLoading, apiError] = useStocktakingItemByQr(scannedQr, stocktakingId);
    const [hasMadeApiCall, setHasMadeApiCall] = useState(false);

    const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;



    const viewModes = [
        { mode: 'grid', icon: 'view_module' },
        { mode: 'detailed', icon: 'view_list' },
        { mode: 'compact', icon: 'view_agenda' }
    ];
    const currentViewIdx = viewModes.findIndex(vm => vm.mode === pageState.viewMode);
    const nextViewMode = () => {
        const newViewMode = viewModes[(currentViewIdx + 1) % viewModes.length].mode;
        const currentViewMode = pageState.viewMode;
        
        updatePageState({ viewMode: newViewMode });
        
        // Only refetch if switching FROM compact (no images) TO grid/detailed (with images)
        // AND we don't already have images for current page
        if (currentViewMode === 'compact' && newViewMode !== 'compact' && !hasImagesForCurrentPage && canFetch) {
            refetchWithImages();
        }
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

    const showActionModal = (title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    };

    function handleScan(scannedValue) {
        // Step 1: Close scanner modal
        setIsQRModalOpen(false);
        
        // Step 2: Clear previous data and prepare for new scan
        setScannedItem(null);
        setHasMadeApiCall(false);
        
        // Step 3: Show skeleton modal immediately
        setIsPreviewModalOpen(true);
        setIsNotInInventoryModalOpen(false);
        
        // Step 4: Trigger API request
        setScannedQr(scannedValue);
    }

    // Effect to handle API result from QR scan
    useEffect(() => {
        if (scannedQr) {
            // Only process when API call is complete (not loading)
            if (apiLoading) {
                setHasMadeApiCall(true); // Mark that we've made an API call
                return;
            }
            
            // Only process if we've actually made an API call
            if (!hasMadeApiCall) {
                return;
            }
            
            // API call completed - close skeleton modal and show appropriate modal
            setScannedQr(null);
            setHasMadeApiCall(false);
            
            if (apiItem) {
                setScannedItem(apiItem);
                
                if (apiItem.location && location && apiItem.location.room !== location.room) {
                    // Show move modal
                    setMoveItem(apiItem);
                    setMoveNewLocation(location);
                    setIsMoveModalOpen(true);
                    setIsPreviewModalOpen(false);
                } else {
                    // Keep preview modal open with real data (skeleton will be replaced)
                }
            } else if (apiError || (!apiLoading && !apiItem)) {
                // Show not in inventory modal
                setIsPreviewModalOpen(false);
                setIsNotInInventoryModalOpen(true);
            }
        }
    }, [apiItem, apiLoading, apiError, scannedQr, location, hasMadeApiCall]);

    // Function to render item actions (context menu)
    const renderItemActions = (item) => (
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
                icon={item.state === 'nalezeno' ? 'visibility_off' : 'visibility'}
                label={item.state === 'nalezeno' ? 'Nenalezeno' : 'Nalezeno'}
                action={async () => {
                  const { image, ...rest } = item;
                  const newState = item.state === 'nalezeno' ? 'zbyva' : 'nalezeno';
                  const result = await updateItem({ ...rest, stocktakingId: stocktakingId, state: newState });
                  if (result) {
                    const message = newState === 'nalezeno' 
                        ? 'Položka byla označena jako nalezena.' 
                        : 'Položka byla označena jako nenalezena.';
                    showActionModal('Hotovo', message, true);
                    refetchItems();
                  } else {
                    const errorMessage = newState === 'nalezeno'
                        ? 'Nepodařilo se označit položku jako nalezenou.'
                        : 'Nepodařilo se označit položku jako nenalezenou.';
                    showActionModal('Chyba', errorMessage, false);
                  }
                }}
            />
        </ContextButton>
    );

    // Reset page to 0 when search or filters change
    useEffect(() => {
        updatePageState({ currentPage: 0 });
    }, [pageState.searchTerm, pageState.filterState]);

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

                <UserLocationPicker onChange={setLocation} />

                {error ? <div>Chyba: {error.message}</div> : null}
                <div className="flex flex-col gap-2">
                    {loading ? (
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
                                            href={`/stocktakingList/${stocktakingId}/${item.id}`}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <StocktakingItemCard item={item} renderActions={renderItemActions} compact={false} />
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {pageState.viewMode === 'detailed' && (
                                items.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/stocktakingList/${stocktakingId}/${item.id}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <StocktakingItemCard item={item} renderActions={renderItemActions} compact={false} />
                                    </Link>
                                ))
                            )}

                            {pageState.viewMode === 'compact' && (
                                items.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/stocktakingList/${stocktakingId}/${item.id}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <StocktakingItemCard item={item} renderActions={renderItemActions} compact={true} />
                                    </Link>
                                ))
                            )}
                        </>
                    )}
                </div>
                <Pagination
                    currentPage={pageState.currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => updatePageState({ currentPage: page })}
                />
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
                <FilterOptionsModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    initialState={pageState.filterState.state}
                    initialHasNote={pageState.filterState.hasNote}
                    onChange={({ state, hasNote }) => {
                        updatePageState({ 
                            filterState: { state, hasNote },
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
                            Položka není součástí inventurního seznamu.
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
                                    const { image, ...rest } = scannedItem;
                                    const result = await updateItem({ ...rest, stocktakingId: stocktakingId, state: 'nalezeno' });
                                    setIsPreviewModalOpen(false);
                                    if (result) {
                                        showActionModal('Hotovo', 'Položka byla označena jako nalezená.', true);
                                        refetchItems();
                                    } else {
                                        showActionModal('Chyba', 'Položku se nepodařilo označit jako nalezenou.', false);
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
                          const result = await updateItem({ ...rest, stocktakingId: stocktakingId, location: moveNewLocation, state: 'presun' });
                          setIsMoveModalOpen(false);
                          setMoveItem(null);
                          setMoveNewLocation(null);
                          if (result) {
                            showActionModal('Hotovo', 'Položka byla úspěšně přesunuta.', true);
                            refetchItems();
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
            </div>
        </main>
    );
}