"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStocktakingLists } from "@/hooks/useStocktakingLists";
import HeadingCard from "@/components/HeadingCard";
import SortOptionsModal from "@/components/SortOptionsModal";
import { Pagination } from "@/components/Pagination";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import CardItemName from "@/components/molecules/CardItemName";
import CardItemDescription from "@/components/molecules/CardItemDescription";
import CardItemDate from "@/components/molecules/CardItemDate";
import CardContainer from "@/components/CardContainer";
import StocktakingListCard from "@/components/organisms/StocktakingListCard";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Datum', value: 'date' },
    { label: 'Poznámka', value: 'note' }
];

export default function StocktakingOperationsList() {
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const { selectInventura } = useSelectedInventura();

    const [operations, total, loading, error] = useStocktakingLists({ 
        offset: page * PAGE_SIZE, 
        limit: PAGE_SIZE,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });

    const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

    const handleInventuraClick = (op) => {
        selectInventura(op);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center">
            <main className="container" style={{ minHeight: "100vh", background: "#fff", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
                <HeadingCard
                    heading="Seznam inventur"
                    leftActions={[
                        {
                            icon: "home", href: "/"
                        }
                    ]}
                    rightActions={[
                        { icon: "sort", onClick: () => setIsOptionsModalOpen(true) }
                    ]}
                />

                {loading ? <div>Načítání...</div> : null}
                {error ? <div>Chyba: {error.message}</div> : null}
                <div className="flex flex-col gap-2">
                    {operations.map(op => (
                        <StocktakingListCard
                            key={op.id}
                            operation={op}
                            href={`/stocktakingList/${op.id}`}
                            onClick={() => handleInventuraClick(op)}
                        />
                    ))}
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => {
                        setPage(newPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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