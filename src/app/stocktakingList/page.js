"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchStocktakingOperations } from "@/mockApi";
import { usePathname, useSearchParams } from "next/navigation";
import HeadingCard from "@/components/HeadingCard";
import SortOptionsModal from "@/components/SortOptionsModal";
import { Pagination } from "@/components/Pagination";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Datum', value: 'date' },
    { label: 'Poznámka', value: 'note' }
];

export default function StocktakingOperationsList() {
    const [operations, setOperations] = useState([]);
    const [sortBy, setSortBy] = useState("id");
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [sortOrder, setSortOrder] = useState('asc');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid, detailed, compact
    const { selectInventura } = useSelectedInventura();

    const viewModes = [
        { mode: 'grid', icon: 'view_module' },
        { mode: 'detailed', icon: 'view_list' },
        { mode: 'compact', icon: 'view_agenda' }
    ];
    const currentViewIdx = viewModes.findIndex(vm => vm.mode === viewMode);
    const nextViewMode = () => {
        setViewMode(viewModes[(currentViewIdx + 1) % viewModes.length].mode);
    };

    const handleInventuraClick = (op) => {
        selectInventura(op);
    };

    useEffect(() => {
        setLoading(true);
        fetchStocktakingOperations({ offset: page * PAGE_SIZE, limit: PAGE_SIZE }).then(res => {
            setOperations(res.operations);
            setTotal(res.total);
            setLoading(false);
        });
    }, [page]);

    const sorted = operations.slice().sort((a, b) => {
        let compare = 0;
        if (sortBy === 'id') {
            compare = a.id - b.id;
        } else if (sortBy === 'date') {
            compare = new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'note') {
            compare = a.note.localeCompare(b.note);
        }
        return sortOrder === 'asc' ? compare : -compare;
    });

    const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

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
                <div className="flex gap-2 flex-col">
                    {sorted.map(op => (
                        <Link 
                            key={op.id} 
                            href={`/`} 
                            style={{ textDecoration: "none" }}
                            onClick={() => handleInventuraClick(op)}
                        >
                            <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                <div className="p-4 gap-4 flex flex-col">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{op.name || `Inventura #${op.id}`}</span>
                                            <span className="material-icons-round" style={{ fontSize: 18, color: '#000' }}>arrow_forward_ios</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: "#535353" }}>{op.note}</div>
                                    </div>
                                    <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                        Datum: {op.date}
                                    </div>
                                </div>
                            </div>
                        </Link>
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
                    }}
                />
            </main>
        </div>
    );
}