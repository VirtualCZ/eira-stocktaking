"use client";
import React, { useState, useEffect } from "react";
import { fetchStocktaking } from "../../mockApi";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function StocktakingList() {
    const [viewType, setViewType] = useState("wide");
    const [sortBy, setSortBy] = useState("name");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchStocktaking({ offset: page * PAGE_SIZE, limit: PAGE_SIZE }).then(res => {
            setItems(res.items);
            setTotal(res.total);
            setLoading(false);
        });
    }, [page]);

    // Sorting (client-side for demo)
    function compare(a, b, key) {
        if (key === "lastCheck") return new Date(b.lastCheck) - new Date(a.lastCheck);
        if (key === "colors") return (a.colors[0] || "").localeCompare(b.colors[0] || "");
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    }
    const sorted = [...items].sort((a, b) => compare(a, b, sortBy));

    return (
        <div className="relative min-h-screen flex flex-col items-center" style={{ background: "#F2F3F5" }}>
            <main className="container" style={{ minHeight: "100vh", background: "#F2F3F5", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Seznam inventur</h1>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                        <button onClick={() => setViewType("wide")} style={{ marginRight: 8, padding: "6px 12px", borderRadius: 6, border: viewType === "wide" ? "2px solid #1976d2" : "1px solid #ccc", background: viewType === "wide" ? "#e3f2fd" : "#fff", cursor: "pointer" }}>
                            <span className="material-icons-round">density_small</span>
                        </button>
                        <button onClick={() => setViewType("narrow")} style={{ padding: "6px 12px", borderRadius: 6, border: viewType === "narrow" ? "2px solid #1976d2" : "1px solid #ccc", background: viewType === "narrow" ? "#e3f2fd" : "#fff", cursor: "pointer" }}>
                            <span className="material-icons-round">density_medium</span>
                        </button>
                    </div>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}>
                        <option value="name">Název (A-Z)</option>
                        <option value="lastCheck">Datum kontroly</option>
                        <option value="note">Poznámka</option>
                        <option value="colors">Barva</option>
                    </select>
                </div>
                {loading ? <div>Načítání...</div> : null}
                <div>
                    {sorted.map(item => (
                        <Link key={item.id} href={`/stocktakingDetail/${item.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ display: "flex", alignItems: viewType === "wide" ? "flex-start" : "center", background: "#fff", borderRadius: 10, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: viewType === "wide" ? 18 : 10, minHeight: viewType === "wide" ? 100 : 56, transition: "all 0.2s", cursor: "pointer" }}>
                                <img src={item.image} alt={item.name} style={{ width: viewType === "wide" ? 64 : 36, height: viewType === "wide" ? 64 : 36, objectFit: "contain", borderRadius: 8, marginRight: 18 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: viewType === "wide" ? 20 : 16, marginBottom: 4 }}>{item.name}</div>
                                    <div style={{ color: "#555", fontSize: 14 }}>
                                        {viewType === "wide" && (
                                            <>
                                                <div>Datum kontroly: <b>{item.lastCheck}</b></div>
                                                <div>Poznámka: <b>{item.note}</b></div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 0 0" }}>
                                                    {item.colors.map((color, idx) => (
                                                        <span key={idx} style={{ display: "inline-block", width: 18, height: 18, borderRadius: "50%", background: color, border: "1px solid #ccc" }} title={color}></span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {viewType === "narrow" && (
                                            <>
                                                <div>Datum: <b>{item.lastCheck}</b></div>
                                                <div style={{ color: "#888", fontSize: 13 }}>{item.note}</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 0 0" }}>
                                                    {item.colors.map((color, idx) => (
                                                        <span key={idx} style={{ display: "inline-block", width: 18, height: 18, borderRadius: "50%", background: color, border: "1px solid #ccc" }} title={color}></span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                    <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #ccc", background: page === 0 ? "#eee" : "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}>Předchozí</button>
                    <span>Strana {page + 1} / {Math.ceil(total / PAGE_SIZE)}</span>
                    <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #ccc", background: (page + 1) * PAGE_SIZE >= total ? "#eee" : "#fff", cursor: (page + 1) * PAGE_SIZE >= total ? "not-allowed" : "pointer" }}>Další</button>
                </div>
            </main>
        </div>
    );
}