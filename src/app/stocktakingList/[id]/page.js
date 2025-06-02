"use client";
import React, { useState, useEffect } from "react";
import { fetchStocktaking } from "@/mockApi";
import Link from "next/link";
import Card from "@/components/Card";
import Modal from "@/components/Modal"; import Button from "@/components/Button";
import QRScannerModal from "@/components/QRScannerModal";
import TextInput from "@/components/TextInput";
import PageHeading from "@/components/PageHeading";
import { usePathname } from "next/navigation";
;

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka', value: 'note' },
    { label: 'Barva', value: 'color' }
];

export default function StocktakingList() {
    const pathname = usePathname();
    const [viewType, setViewType] = useState("wide");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('asc');
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchStocktaking({ offset: page * PAGE_SIZE, limit: PAGE_SIZE }).then(res => {
            setItems(res.items);
            setTotal(res.total);
            setLoading(false);
        });
    }, [page]);

    // Sorting (client-side for demo)
    const sorted = items.slice().sort((a, b) => {
        let compare = 0;
        if (sortBy === 'id') {
            compare = a.id - b.id;
        } else if (sortBy === 'id') {
            compare = a.name.localeCompare(b.name);
        } else if (sortBy === 'lastCheck') {
            compare = new Date(a.lastCheck) - new Date(b.lastCheck);
        } else if (sortBy === 'note') {
            compare = a.note.localeCompare(b.note);
        } else if (sortBy === 'color') {
            compare = a.color.localeCompare(b.color);
        }
        return sortOrder === 'asc' ? compare : -compare;
    });

    const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;


    function handleScan(dataString) {
        let parsed;
        try {
            parsed = JSON.parse(dataString);
        } catch {
            alert("Neplatný JSON formát.");
            return;
        }

        if (parsed.type !== "item" || !parsed.data || typeof parsed.data.id !== "number") {
            alert("QR kód neobsahuje platnou položku.");
            return;
        }

        // Use real items instead of hardcoded ones
        const found = items.find(item => item.id === parsed.data.id);

        if (found) {
            setScannedItem(found);
            setEditItem({ ...found }); // clone to allow editing
            setIsPreviewModalOpen(true);
        } else {
            const emptyItem = { id: parsed.data.id, name: "Neznámá položka", note: "", image: "" };
            setScannedItem(emptyItem);
            setEditItem(emptyItem);
            setIsPreviewModalOpen(true);
        }
    }


    return (
        <div className="relative min-h-screen flex flex-col items-center" style={{ background: "#F2F3F5" }}>
            <main className="container" style={{ minHeight: "100vh", background: "#F2F3F5", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
                <PageHeading heading="Předměty v inventuře" route="/" />
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
                {loading ? <div>Načítání...</div> : null}
                <Button
                    onClick={() => setIsQRModalOpen(true)}
                    aria-label="Open QR Scanner"
                >Skenovat položku
                </Button>
                <div className="flex gap-4 flex-col">
                    {sorted.map(item => (
                        <Link
                            key={item.id}
                            href={`/stocktakingDetail/${item.id}?returnTo=${encodeURIComponent(pathname)}`}
                            style={{ textDecoration: "none" }}>
                            <Card style={{ flexDirection: "row" }}>
                                <img src={item.image} alt={item.name} style={{ width: viewType === "wide" ? 64 : 36, height: viewType === "wide" ? 64 : 36, objectFit: "contain", borderRadius: 8, marginRight: 18 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: viewType === "wide" ? 20 : 16, marginBottom: 4 }}>{item.name}</div>
                                    <div style={{ color: "#555", fontSize: 14 }}>
                                        {viewType === "wide" && (
                                            <>
                                                <div>Datum kontroly: <b>{item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}</b></div>
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
                                                <div>Datum: <b>{item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}</b></div>
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
                <Modal title="Možnosti zobrazení" isOpen={isOptionsModalOpen} onClose={() => setIsOptionsModalOpen(false)}>
                    <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                        {/* Display Options Card */}
                        <Card name="Zobrazení" nameStyle={{ padding: "1rem", paddingBottom: 0 }} style={{ padding: 0, gap: 0 }}>
                            {[{ label: 'Velké', value: 'wide' }, { label: 'Detailní', value: 'narrow' }].map((opt, idx, arr) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setViewType(opt.value)}
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
                                        checked={viewType === opt.value}
                                        onChange={() => setViewType(opt.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ accentColor: '#b640ff', width: 20, height: 20 }}
                                    />
                                </button>
                            ))}
                        </Card>
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
                <QRScannerModal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    onScan={handleScan}
                    validate={parsed => {
                        if (parsed.type === "item" && parsed.data && typeof parsed.data.id === "number") {
                            return {
                                valid: true,
                                message: `Naskenováno ID položky: ${parsed.data.id}`,
                                data: parsed.data
                            };
                        }
                        return { valid: false, message: "QR kód neobsahuje platnou položku." };
                    }}
                />
                <Modal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    title="Náhled položky"
                    contentStyle={{
                        gap: "1rem",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {scannedItem && (
                        <>
                            {scannedItem.name ? (
                                <>
                                    <Card>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                            }}
                                        >
                                            {scannedItem.name}
                                        </div>
                                        <img
                                            src={scannedItem.image}
                                            alt={scannedItem.name}
                                            style={{
                                                width: "100%",
                                                maxHeight: 150,
                                                objectFit: "contain",
                                                borderRadius: "1rem",
                                            }}
                                        />
                                        <Button
                                            onClick={() => router.push(`/stocktakingDetail/${scannedItem.id}`)}
                                        >
                                            Editovat
                                        </Button>
                                    </Card>

                                    {editItem && (
                                        <>
                                            <TextInput
                                                label="Poznámka"
                                                value={editItem.note}
                                                onChange={(e) => setEditItem({ ...editItem, note: e.target.value })}
                                            />
                                        </>
                                    )}

                                    <Button
                                        onClick={() => {
                                            if (!editItem) return;
                                            const now = new Date().toISOString();
                                            setItems((prevItems) => prevItems.map(item =>
                                                item.id === editItem.id ? { ...item, lastCheck: now, note: editItem.note } : item
                                            ));
                                            setEditItem({ ...editItem, lastCheck: now });
                                            setIsPreviewModalOpen(false);
                                        }}
                                    >
                                        OK
                                    </Button>

                                    <Button onClick={() => setIsPreviewModalOpen(false)}>
                                        Zavřít
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                                        Položka s ID {scannedItem.id} nebyla nalezena.
                                    </div>
                                    <Button
                                        style={{
                                            margin: 8,
                                            padding: "8px 16px",
                                            background: "#b640ff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            router.push(
                                                `/stocktakingDetail/new?preloadId=${scannedItem.id}`
                                            );
                                            setIsPreviewModalOpen(false);
                                        }}
                                    >
                                        Přidat novou položku
                                    </Button>
                                    <Button onClick={() => setIsPreviewModalOpen(false)}>Zavřít</Button>
                                </>
                            )}
                        </>
                    )}
                </Modal>

            </main>
        </div >
    );
}