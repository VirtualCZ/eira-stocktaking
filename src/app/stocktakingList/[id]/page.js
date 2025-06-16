"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { fetchStocktaking } from "@/mockApi";
import Link from "next/link";
import Card from "@/components/Card";
import Modal from "@/components/Modal"; import Button from "@/components/Button";
import QRScannerModal from "@/components/QRScannerModal";
import TextInput from "@/components/TextInput";
import PageHeading from "@/components/PageHeading";
import { usePathname, useSearchParams } from "next/navigation";
import HeadingCard from "@/components/HeadingCard";
import LocationNavCard from "@/components/LocationNavCard";
import { ContextButton, ContextRow } from "@/components/ContextMenu";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka', value: 'note' },
    { label: 'Barva', value: 'color' }
];

export default function StocktakingList() {
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const pathname = usePathname();
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('asc');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const totalItems = 70; // Example total items
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const [viewMode, setViewMode] = useState('detailed'); // 'grid', 'detailed', 'compact'

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

    const viewModeOptions = [
        { value: 'grid', label: 'Mřížka' },
        { value: 'detailed', label: 'Detailní' },
        { value: 'compact', label: 'Kompaktní' },
    ];

    useEffect(() => {
        setLoading(true);
        fetchStocktaking({ offset: currentPage * PAGE_SIZE, limit: PAGE_SIZE }).then(res => {
            setItems(res.items);
            setLoading(false);
        });
    }, [currentPage]);

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

    // const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;


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
        <div className="relative min-h-screen flex flex-col items-center">
            <main className="container flex flex-col gap-4 p-4" style={{ minHeight: "100vh", paddingBottom: bottomPadding }}>
                <PageHeading heading="Předměty v inventuře" route={returnTo} />

                <HeadingCard
                    heading="Seznam položek"
                    leftActions={[
                        { icon: "home", onClick: () => alert("Home") },
                    ]}
                    rightActions={[
                        { icon: "filter_alt", onClick: () => setIsOptionsModalOpen(true) },
                        { icon: "sort", onClick: () => setIsOptionsModalOpen(true) },
                        {
                            icon: viewMode === 'grid' ? 'grid_view' : viewMode === 'detailed' ? 'view_list' : 'view_module',
                            onClick: () => {
                                const modes = ['grid', 'detailed', 'compact'];
                                setViewMode(modes[(modes.indexOf(viewMode) + 1) % modes.length]);
                            }
                        }
                    ]}
                />

                <LocationNavCard editMode={true} />

                {loading ? <div>Načítání...</div> : null}
                {/* <Button
                    onClick={() => setIsQRModalOpen(true)}
                    aria-label="Open QR Scanner"
                >Skenovat položku
                </Button> */}
                <div className="flex flex-col gap-2">
                    <>
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                                {sorted.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/stocktakingDetail/${item.id}?returnTo=${encodeURIComponent(`${pathname}${searchParams.has('returnTo') ? `?returnTo=${encodeURIComponent(searchParams.get('returnTo'))}` : ''}`)}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <div className="flex flex-col rounded-2xl overflow-hidden bg-[#f0f1f3] h-full">
                                            {/* Image */}
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                                            />
                                            {/* Content */}
                                            <div className="p-4 flex flex-col justify-between flex-grow">
                                                {/* First part */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
                                                        <ContextButton>
                                                            <ContextRow
                                                                icon="swap_horiz"
                                                                label="Přesun"
                                                                action={() => alert('Přesun clicked')}
                                                            />
                                                            <ContextRow
                                                                icon="visibility"
                                                                label="Nalezeno"
                                                                action={() => alert('Nalezeno clicked')}
                                                            />
                                                        </ContextButton>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#535353" }}>{item.note}</div>
                                                </div>
                                                {/* Second part */}
                                                <div className="italic text-xs text-[#535353] mt-2">
                                                    Poslední kontrola {item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}


                        {viewMode === 'detailed' && (
                            <Link
                                key={item.id}
                                href={`/stocktakingDetail/${item.id}?returnTo=${encodeURIComponent(`${pathname}${searchParams.has('returnTo') ? `?returnTo=${encodeURIComponent(searchParams.get('returnTo'))}` : ''}`)}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                    {/* Top: Image */}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                                    />
                                    {/* Bottom: Content */}
                                    <div className="p-4 gap-4 flex flex-col">
                                        {/* First part */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
                                                <ContextButton>
                                                    <ContextRow
                                                        icon="swap_horiz"
                                                        label="Přesun"
                                                        action={() => alert('Přesun clicked')}
                                                    />
                                                    <ContextRow
                                                        icon="visibility"
                                                        label="Nalezeno"
                                                        action={() => alert('Nalezeno clicked')}
                                                    />
                                                </ContextButton>
                                            </div>
                                            <div style={{ fontSize: 12, color: "#535353" }}>{item.note}</div>
                                        </div>
                                        {/* Second part */}
                                        <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                            Poslední kontrola {item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                        {viewMode === 'compact' && (
                            <Link
                                key={item.id}
                                href={`/stocktakingDetail/${item.id}?returnTo=${encodeURIComponent(`${pathname}${searchParams.has('returnTo') ? `?returnTo=${encodeURIComponent(searchParams.get('returnTo'))}` : ''}`)}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                    {/* Bottom: Content */}
                                    <div className="p-4 gap-4 flex flex-col">
                                        {/* First part */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
                                                <ContextButton>
                                                    <ContextRow
                                                        icon="content_copy"
                                                        label="Duplicate"
                                                        action={() => alert('Duplicate clicked')}
                                                    />
                                                    <ContextRow
                                                        icon="delete"
                                                        label="Delete"
                                                        action={() => alert('Delete clicked')}
                                                        color="#FF6262"
                                                    />
                                                </ContextButton>
                                            </div>
                                            <div style={{ fontSize: 12, color: "#535353" }}>{item.note}</div>
                                        </div>
                                        {/* Second part */}
                                        <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                            Poslední kontrola {item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(newPage) => {
                        setCurrentPage(newPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
                {/* Fixed bottom bar with search and QR button */}
                <div
                    ref={bottomBarRef}
                    style={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        padding: 16,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                    }}
                >
                    {/* Search input */}
                    <div style={{
                        flex: 1,
                        background: '#282828',
                        color: '#fff',
                        padding: 12,
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        <span className="material-icons-round" style={{ fontSize: 16, color: '#fff' }}>search</span>
                        <input
                            type="text"
                            placeholder="Hledat..."
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#fff',
                                fontSize: 14,
                                flex: 1,
                                height: "16px"
                            }}
                        />
                    </div>
                    {/* QR button */}
                    <button
                        style={{
                            background: '#282828',
                            color: '#fff',
                            padding: 12,
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onClick={() => alert('QR scan')}
                    >
                        <span className="material-icons-round" style={{ fontSize: 16, color: '#fff' }}>qr_code</span>
                    </button>
                </div>
                <Modal title="Možnosti zobrazení" isOpen={isOptionsModalOpen} onClose={() => setIsOptionsModalOpen(false)}>
                    <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                        {/* Display Options Card */}
                        <Card name="Zobrazení" nameStyle={{ padding: "1rem", paddingBottom: 0 }} style={{ padding: 0, gap: 0 }}>
                            <div className="flex gap-2 mb-4">
                                {viewModeOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setViewMode(opt.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${viewMode === opt.value ? 'bg-black text-white' : 'bg-[#ebedef] text-black'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
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