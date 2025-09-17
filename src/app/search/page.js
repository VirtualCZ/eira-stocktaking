"use client";
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useAllObjects } from "@/hooks/useAllObjects";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { usePageState } from "@/hooks/usePageState";
import Link from "next/link";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import { useRouter } from "next/navigation";
import HeadingCard from "@/components/molecules/HeadingCard";
import { ContextButton, ContextRow } from "@/components/molecules/ContextMenu";
import { Pagination } from "@/components/molecules/Pagination";
import SortOptionsModal from "@/components/organisms/SortOptionsModal";
import CenteredModal from "@/components/molecules/CenteredModal";
import StocktakingItemCard from "@/components/organisms/StocktakingItemCard";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";
import FilterOptionsModal from "@/components/organisms/FilterOptionsModal";
import Button from "@/components/atoms/Button";
import UserLocationPicker from "@/components/organisms/UserLocationPicker";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka k inventuře', value: 'note' },
];

export default function SearchPage() {
    const router = useRouter();
    const { selectedInventura } = useSelectedInventura();
    const [location, setLocation] = useState(null);
    
    // Use page state for filters and sorting
    const [pageState, updatePageState, resetPageState] = usePageState('searchPage', {
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


    const hookOptions = useMemo(() => ({
        offset: pageState.currentPage * PAGE_SIZE,
        limit: PAGE_SIZE,
        sortBy: pageState.sortBy,
        sortOrder: pageState.sortOrder,
        search: pageState.searchTerm,
        state: pageState.filterState.state,
        hasNote: pageState.filterState.hasNote,
        eventId: selectedInventura?.id,
        roomId: location?.room,
        buildingId: location?.building,
        storeyId: location?.storey,
        noLocation: !location?.building && !location?.storey && !location?.room,
        // entregIds: [123, 456, 789], // Example: Filter by specific object types
        includeImages: pageState.viewMode !== 'compact', // Start with current view mode preference
    }), [
        pageState.currentPage,
        pageState.sortBy,
        pageState.sortOrder,
        pageState.searchTerm,
        pageState.filterState.state,
        pageState.filterState.hasNote,
        selectedInventura?.id,
        location?.room,
        location,
        pageState.viewMode
    ]);

    const [items, total, loading, error, refetchItems, refetchWithImages, hasImagesForCurrentPage] = useAllObjects(hookOptions);

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
        if (currentViewMode === 'compact' && newViewMode !== 'compact' && !hasImagesForCurrentPage) {
            refetchWithImages();
        }
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
                action={() => router.push(`/stocktakingList/${selectedInventura?.id}/${item.id}?edit=1`)}
            />
            <ContextRow
                icon="visibility"
                label="Zobrazit detail"
                action={() => router.push(`/stocktakingList/${selectedInventura?.id}/${item.id}`)}
            />
        </ContextButton>
    );



    // Reset page to 0 when search, filters, or location change
    useEffect(() => {
        updatePageState({ currentPage: 0 });
    }, [pageState.searchTerm, pageState.filterState, location]);

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
                        { icon: "filter_alt", onClick: () => setIsFilterModalOpen(true) },

                    ]}
                />

                {!selectedInventura && (
                    <div style={{ color: '#FF6262', fontWeight: 600, padding: '1rem' }}>
                        Nejprve vyberte inventuru na hlavní stránce.
                    </div>
                )}

                {/* Location filter */}
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
                                            href={`/stocktakingList/${selectedInventura?.id}/${item.id}`}
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
                                        href={`/stocktakingList/${selectedInventura?.id}/${item.id}`}
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
                                        href={`/stocktakingList/${selectedInventura?.id}/${item.id}`}
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