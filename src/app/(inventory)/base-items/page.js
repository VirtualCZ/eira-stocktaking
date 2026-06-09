"use client";
import React, { useState, useLayoutEffect, useRef } from "react";
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
import { Pagination } from "@/components/molecules/Pagination";
import UserLocationPicker from "@/components/organisms/UserLocationPicker";
import { useBaseItemsInventoryLayout } from "@/contexts/BaseItemsInventoryLayoutContext";
import {
  buildStocktakingNewItemUrl,
  headingBackAction,
  HOME_PATH,
} from "@/utils/inventoryNavigation";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";

const sortOptions = [
    { label: "ID", value: "id" },
    { label: "Jméno", value: "name" },
    { label: "Popisek", value: "description" },
];

export default function BaseItemsPage() {
    const router = useRouter();
    const { selectedInventura } = useSelectedInventura();
    const {
        pageState,
        updatePageState,
        pageSize,
        handleLocationChange,
        items,
        total,
        loading,
        error,
        goToPage1Based,
        appendNextChunk,
        highlightPage1Based,
        canAppendMore,
        persistFeedState,
        persistScrollState,
    } = useBaseItemsInventoryLayout();

    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isNotInInventoryModalOpen, setIsNotInInventoryModalOpen] = useState(false);

    const viewModes = [
        { mode: "grid", icon: "view_module" },
        { mode: "detailed", icon: "view_list" },
        { mode: "compact", icon: "view_agenda" },
    ];
    const currentViewIdx = viewModes.findIndex((vm) => vm.mode === pageState.viewMode);
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

    function handleScan() {
        setIsQRModalOpen(false);
        setIsNotInInventoryModalOpen(true);
    }

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

    return (
        <main className="relative min-h-screen flex flex-col items-center">
            <div
                className="container"
                style={{
                    minHeight: "100vh",
                    background: "#fff",
                    display: "flex",
                    padding: "1rem",
                    paddingBottom: `calc(1rem + ${bottomPadding}px)`,
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <HeadingCard
                    heading="Majetek"
                    leftActions={[headingBackAction(HOME_PATH)]}
                    rightActions={[
                        {
                            icon: viewModes[currentViewIdx].icon,
                            onClick: nextViewMode,
                            title: "Změnit zobrazení",
                        },
                        { icon: "sort", onClick: () => setIsOptionsModalOpen(true) },
                    ]}
                />

                <UserLocationPicker onChange={handleLocationChange} />

                {error ? <div>Chyba: {error.message}</div> : null}
                <div className="flex flex-col gap-2">
                    {loading && items.length === 0 ? (
                        <>
                            {pageState.viewMode === "grid" && (
                                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                                    {Array.from({ length: pageSize }, (_, index) => (
                                        <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={false} />
                                    ))}
                                </div>
                            )}
                            {pageState.viewMode === "detailed" &&
                                Array.from({ length: pageSize }, (_, index) => (
                                    <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={false} />
                                ))}
                            {pageState.viewMode === "compact" &&
                                Array.from({ length: pageSize }, (_, index) => (
                                    <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={true} />
                                ))}
                        </>
                    ) : (
                        <>
                            {pageState.viewMode === "grid" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                                        {items.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/itemList/${item.id}`}
                                                scroll={false}
                                                onClick={() => {
                                                    persistFeedState();
                                                    persistScrollState({ anchorId: item.id });
                                                }}
                                                style={{ textDecoration: "none" }}
                                                data-feed-item-id={item.id}
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
                                    {loading && items.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4 auto-rows-fr mt-4">
                                            {Array.from({ length: pageSize }, (_, index) => (
                                                <StocktakingItemCardSkeleton key={`append-skel-${index}`} compact={false} />
                                            ))}
                                        </div>
                                    ) : null}
                                </>
                            )}
                            {pageState.viewMode === "detailed" && (
                                <>
                                    {items.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/itemList/${item.id}`}
                                            scroll={false}
                                            onClick={() => {
                                                persistFeedState();
                                                persistScrollState({ anchorId: item.id });
                                            }}
                                            style={{ textDecoration: "none" }}
                                            data-feed-item-id={item.id}
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
                                    {loading && items.length > 0
                                        ? Array.from({ length: pageSize }, (_, index) => (
                                              <StocktakingItemCardSkeleton key={`append-skel-${index}`} compact={false} />
                                          ))
                                        : null}
                                </>
                            )}

                            {pageState.viewMode === "compact" && (
                                <>
                                    {items.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/itemList/${item.id}`}
                                            scroll={false}
                                            onClick={() => {
                                                persistFeedState();
                                                persistScrollState({ anchorId: item.id });
                                            }}
                                            style={{ textDecoration: "none" }}
                                            data-feed-item-id={item.id}
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
                                    ))}
                                    {loading && items.length > 0
                                        ? Array.from({ length: pageSize }, (_, index) => (
                                              <StocktakingItemCardSkeleton key={`append-skel-${index}`} compact={true} />
                                          ))
                                        : null}
                                </>
                            )}
                        </>
                    )}
                </div>
                <Pagination
                    variant="feed"
                    total={total}
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
                        background:
                            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.25) 100%)",
                    }}
                >
                    <div className="container flex items-center gap-2 p-4">
                        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white">
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Hledat..."
                                value={pageState.searchTerm}
                                onChange={(e) => updatePageState({ searchTerm: e.target.value })}
                                className="flex-1 bg-transparent border-none outline-none text-white h-4"
                                style={{ fontSize: "16px" }}
                            />
                        </div>

                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer"
                            onClick={() => setIsQRModalOpen(true)}
                        >
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>
                                qr_code
                            </span>
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
                        updatePageState({ sortBy: newSortBy, sortOrder: newSortOrder, currentPage: 0 });
                    }}
                />
                <QRScannerModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} onScan={handleScan} validate={false} />

                <CenteredModal
                    isOpen={isNotInInventoryModalOpen}
                    onClose={() => setIsNotInInventoryModalOpen(false)}
                    title="QR Sken"
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ color: "#FF6262", fontWeight: 600 }}>Položka nebyla nalezena v databázi.</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            <Button
                                icon="add"
                                iconPosition="right"
                                onClick={() => {
                                    if (!selectedInventura?.id) return;
                                    router.push(
                                        buildStocktakingNewItemUrl(selectedInventura.id, {
                                            returnTo: "/base-items",
                                        })
                                    );
                                }}
                            >
                                Založit novou položku
                            </Button>
                            <Button
                                variant="secondary"
                                icon="close"
                                iconPosition="right"
                                onClick={() => setIsNotInInventoryModalOpen(false)}
                            >
                                Storno
                            </Button>
                        </div>
                    </div>
                </CenteredModal>

            </div>
        </main>
    );
}
