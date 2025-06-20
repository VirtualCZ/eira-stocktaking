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
import RadioButton from "@/components/RadioButton";
import SortOptionsModal from "@/components/SortOptionsModal";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka', value: 'note' },
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
                {/* <PageHeading heading="Předměty v inventuře" route={returnTo} /> */}

                <HeadingCard
                    heading="Seznam položek"
                    leftActions={[
                        {
                            icon: returnTo === "/" ? "home" : "arrow_back", href: returnTo
                        },
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
                            sorted.map(item => (
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
                            ))
                        )}

                        {viewMode === 'compact' && (
                            sorted.map(item => (
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
                            ))

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
                    className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)',
                    }}
                >
                    <div className="container flex items-center gap-2 p-4">
                        {/* Search input */}
                        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white">
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>search</span>
                            <input
                                type="text"
                                placeholder="Hledat..."
                                className="flex-1 bg-transparent border-none outline-none text-white h-4"
                                style={{ fontSize: "16px" }}
                            />
                        </div>

                        {/* QR Button */}
                        <button
                            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer"
                            onClick={() => alert('QR scan')}
                        >
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>qr_code</span>
                        </button>
                    </div>
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