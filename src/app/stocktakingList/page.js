"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { fetchStocktakingOperations } from "@/mockApi";
import Modal from "@/components/Modal";
import PageHeading from "@/components/PageHeading";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Datum', value: 'date' },
    { label: 'Poznámka', value: 'note' }
];

export default function StocktakingOperationsList() {
    const [operations, setOperations] = useState([]);
    const [sortBy, setSortBy] = useState("id");
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
            <main className="container" style={{ minHeight: "100vh", background: "#F2F3F5", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
                <PageHeading heading="Seznam inventur" route="/" />
                {loading ? <div>Načítání...</div> : null}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "#ebedef solid 2px", paddingBottom: "1rem" }}>
                    <button
                        onClick={() => setIsOptionsModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#ebedef',
                            border: 'none',
                            borderRadius: 999,
                            padding: '0.5rem',
                            cursor: 'pointer',
                            gap: '0.5rem',
                        }}
                    >
                        <span className="material-icons-round" style={{ color: '#4e5058', fontSize: '1.3rem' }}>tune</span>
                        <span style={{ flex: 1, textAlign: 'left', color: '#4e5058', fontWeight: 600 }}>Možnosti zobrazení</span>
                        <span className="material-icons-round" style={{ color: '#4e5058', fontSize: '1.3rem' }}>expand_more</span>
                    </button>
                </div>
                <div className="flex gap-4 flex-col">
                    {sorted.map(op => (
                        <Link key={op.id} href={`/stocktakingList/${op.id}`} style={{ textDecoration: "none" }}>
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

                <Modal title="Možnosti zobrazení" isOpen={isOptionsModalOpen} onClose={() => setIsOptionsModalOpen(false)} height="auto">
                    <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                        {/* Sorting Options Card */}
                        <Card name="Seřazení" nameStyle={{ padding: "1rem", paddingBottom: 0 }} style={{ padding: 0, gap: 0 }}>
                            {sortOptions.map((opt, idx, arr) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSortBy(opt.value)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        borderBottom: idx < arr.length - 1 ? '1px solid #ebedef' : 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    <input
                                        type="radio"
                                        checked={sortBy === opt.value}
                                        onChange={() => setSortBy(opt.value)}
                                        onClick={e => e.stopPropagation()}
                                        style={{ accentColor: '#b640ff', width: 20, height: 20 }}
                                    />
                                </button>
                            ))}
                        </Card>
                        <Card style={{ padding: 0, gap: 0 }}>
                            {[{ label: 'Ascending', value: 'asc' }, { label: 'Descending', value: 'desc' }].map((opt, idx, arr) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSortOrder(opt.value)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        borderBottom: idx < arr.length - 1 ? '1px solid #ebedef' : 'none',
                                        marginLeft: 8,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    <input
                                        type="radio"
                                        checked={sortOrder === opt.value}
                                        onChange={() => setSortOrder(opt.value)}
                                        onClick={e => e.stopPropagation()}
                                        style={{ accentColor: '#b640ff', width: 20, height: 20 }}
                                    />
                                </button>
                            ))}
                        </Card>
                    </div>
                </Modal>
            </main>
        </div>
    );
}