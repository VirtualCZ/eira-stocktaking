"use client";
import React, { useState, useEffect } from "react";
import { useStocktakingLists } from "@/hooks/useStocktakingLists";
import HeadingCard from "@/components/molecules/HeadingCard";
import SortOptionsModal from "@/components/organisms/SortOptionsModal";
import { Pagination } from "@/components/molecules/Pagination";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { useSettings } from "@/hooks/useSettings";
import StocktakingListCard from "@/components/organisms/StocktakingListCard";
import { headingBackAction, HOME_PATH } from "@/utils/inventoryNavigation";
import {
    CLOSED_INVENTURA_MESSAGE,
    isInventuraClosed,
} from "@/utils/inventuraEventStates";

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Datum', value: 'date' },
    { label: 'Poznámka k inventuře', value: 'note' }
];

export default function StocktakingOperationsList() {
    const { itemsPerPage } = useSettings();
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const { selectedInventura, selectInventura } = useSelectedInventura();
    const closedInventuraSelected = isInventuraClosed(selectedInventura);

    const [operations, total, loading, error] = useStocktakingLists({ 
        page,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });

    const totalPages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;

    const handleInventuraClick = (op) => {
        selectInventura(op);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center">
            <main className="container" style={{ minHeight: "100vh", background: "#fff", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
                <HeadingCard
                    heading="Seznam inventur"
                    leftActions={[headingBackAction(HOME_PATH)]}
                    rightActions={[
                        { icon: "sort", onClick: () => setIsOptionsModalOpen(true) }
                    ]}
                />

                {closedInventuraSelected && (
                    <div
                        style={{
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: "#fff4f4",
                            border: "1px solid #ffc9c9",
                            color: "#8a1f1f",
                            fontSize: 13,
                            lineHeight: 1.45,
                        }}
                    >
                        {CLOSED_INVENTURA_MESSAGE}
                    </div>
                )}

                {loading ? <div>Načítání...</div> : null}
                {error ? <div>Chyba: {error.message}</div> : null}
                {!loading && !error && operations.length === 0 ? (
                    <div style={{ color: "#535353", fontSize: 14 }}>
                        Žádná inventura ve stavu Zahájený.
                    </div>
                ) : null}
                <div className="flex flex-col gap-2">
                    {operations.map(op => (
                        <StocktakingListCard
                            key={op.id}
                            operation={op}
                            href={`/`}
                            onClick={() => handleInventuraClick(op)}
                        />
                    ))}
                </div>

                <Pagination
                    variant="nav"
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                />

                <SortOptionsModal
                    isOpen={isOptionsModalOpen}
                    onClose={() => setIsOptionsModalOpen(false)}
                    sortOptions={sortOptions}
                    initialSortBy={sortBy}
                    initialSortOrder={sortOrder}
                    onChange={({ sortBy: newSortBy, sortOrder: newSortOrder }) => {
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                        setPage(0); // Reset to first page when sorting changes
                    }}
                />
            </main>
        </div>
    );
}