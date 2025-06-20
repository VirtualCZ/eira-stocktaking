"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { fetchStocktakingOperations } from "@/mockApi";
import Modal from "@/components/Modal";
import PageHeading from "@/components/PageHeading";
import { usePathname } from "next/navigation";
import HeadingCard from "@/components/HeadingCard";
import RadioButton from "@/components/RadioButton";
import SortOptionsModal from "@/components/SortOptionsModal";

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
    const [sortOrder, setSortOrder] = useState('asc');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

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
        <div className="relative min-h-screen flex flex-col items-center" style={{ background: "#F2F3F5" }}>
            <main className="container" style={{ minHeight: "100vh", background: "#fff", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
                {/* <PageHeading heading="Seznam inventur" route="/" /> */}
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
                <div className="flex gap-4 flex-col">
                    {sorted.map(op => (
                        <Link key={op.id} href={`/stocktakingList/${op.id}?returnTo=${encodeURIComponent(pathname)}`} style={{ textDecoration: "none" }}>
                            <Card style={{ flexDirection: "row", alignItems: "center" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>Inventura #{op.id}</div>
                                    <div style={{ color: "#555", fontSize: 14 }}>Datum: <b>{op.date}</b></div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Poznámka: {op.note}</div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24 }}>
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        style={{
                            padding: "8px 20px",
                            border: "none",
                            borderRadius: 8,
                            color: "#b640ff",
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: page === 0 ? "not-allowed" : "pointer",
                            opacity: page === 0 ? 0.5 : 1,
                            transition: "background 0.2s, color 0.2s, opacity 0.2s"
                        }}
                    >Předchozí</button>
                    <span style={{ minWidth: 120, textAlign: "center", color: "#222", fontWeight: 500, fontSize: 16 }}>
                        Strana {page + 1} / {total > 0 ? Math.ceil(total / PAGE_SIZE) : 1}
                    </span>
                    <button
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        style={{
                            padding: "8px 20px",
                            border: "none",
                            borderRadius: 8,
                            color: "#b640ff",
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                            opacity: page + 1 >= totalPages ? 0.5 : 1,
                            transition: "background 0.2s, color 0.2s, opacity 0.2s"
                        }}
                    >Další</button>
                </div>

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