"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { fetchStocktaking } from "@/mockApi";
import Link from "next/link";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import QRScannerModal from "@/components/QRScannerModal";
import TextInput from "@/components/inputs/TextInput";
import { useRouter, useParams } from "next/navigation";
import HeadingCard from "@/components/HeadingCard";
import { ContextButton, ContextRow } from "@/components/ContextMenu";
import { Pagination } from "@/components/Pagination";
import SortOptionsModal from "@/components/SortOptionsModal";
import CenteredModal from "@/components/CenteredModal";
import LocationPicker from "@/components/location/LocationPicker";
import UserLocationPicker from "@/components/location/UserLocationPicker";

const PAGE_SIZE = 10;

const sortOptions = [
    { label: 'ID', value: 'id' },
    { label: 'Jméno', value: 'name' },
    { label: 'Datum', value: 'lastCheck' },
    { label: 'Poznámka', value: 'note' },
];

export default function StocktakingList() {

    const router = useRouter();
    const params = useParams();
    const stocktakingId = params.id;
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('asc');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [scannedItem, setScannedItem] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isNotInInventoryModalOpen, setIsNotInInventoryModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('detailed'); // 'grid', 'detailed', 'compact'
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const totalItems = 70; // Example total items
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const viewModes = [
        { mode: 'grid', icon: 'view_module' },
        { mode: 'detailed', icon: 'view_list' },
        { mode: 'compact', icon: 'view_agenda' }
    ];
    const currentViewIdx = viewModes.findIndex(vm => vm.mode === viewMode);
    const nextViewMode = () => {
        setViewMode(viewModes[(currentViewIdx + 1) % viewModes.length].mode);
    };

    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);

    // Mock data for modal
    const foundItem = {
        name: "Židle Alfa",
        note: "Kancelářská židle z obchodu abcd",
        image: "/file.svg",
    };

    const currentLocation = {
        budova: "A",
        podlazi: "1",
        mistnost: "101",
    };

    const newLocation = {
        budova: "B",
        podlazi: "2",
        mistnost: "202",
    };

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

    useEffect(() => {
        setLoading(true);
        fetchStocktaking({ offset: currentPage * PAGE_SIZE, limit: PAGE_SIZE }).then(res => {
            setItems(res.items);
            setLoading(false);
        });
    }, [currentPage]);

    // Filter items based on search term
    const filteredItems = items.filter(item => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            item.id.toString().includes(searchLower) ||
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.note && item.note.toLowerCase().includes(searchLower))
        );
    });

    // Sorting (client-side for demo)
    const sorted = filteredItems.slice().sort((a, b) => {
        let compare = 0;
        if (sortBy === 'id') {
            compare = a.id - b.id;
        } else if (sortBy === 'id') {
            compare = a.name.localeCompare(b.name);
        } else if (sortBy === 'lastCheck') {
            compare = new Date(a.lastCheck) - new Date(b.lastCheck);
        } else if (sortBy === 'note') {
            compare = a.note.localeCompare(b.note);
        }
        return sortOrder === 'asc' ? compare : -compare;
    });

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
            <main className="container" style={{ minHeight: "100vh", background: "#fff", display: "flex", padding: "1rem", paddingBottom: `calc(1rem + ${bottomPadding}px)`, flexDirection: "column", gap: "1rem" }}>
                <HeadingCard
                    heading="Seznam předmětů"
                    leftActions={[
                        {
                            icon: "home", href: "/"
                        }
                    ]}
                    rightActions={[
                        {
                            icon: viewModes[currentViewIdx].icon,
                            onClick: nextViewMode,
                            title: 'Změnit zobrazení'
                        },
                        { icon: "sort", onClick: () => setIsOptionsModalOpen(true) },
                        { icon: "qr_code_scanner", onClick: () => setIsQrModalOpen(true) },
                        { icon: "add_box", onClick: () => setIsNotInInventoryModalOpen(true) }
                    ]}
                />

                <UserLocationPicker />

                {loading ? <div>Načítání...</div> : null}
                <div className="flex flex-col gap-2">
                    <>
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                                {sorted.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/stocktakingList/${stocktakingId}/${item.id}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <div className="flex flex-col rounded-2xl overflow-visible bg-[#f0f1f3] h-full">
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
                                                                icon="edit"
                                                                label="Edit"
                                                                action={() => router.push(`/stocktakingList/${stocktakingId}/${item.id}?edit=1`)}
                                                            />
                                                            <ContextRow
                                                                icon="visibility"
                                                                label="Upravit"
                                                                action={() => alert('Nalezeno clicked')}
                                                            />
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
                                    href={`/stocktakingList/${stocktakingId}/${item.id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "visible", display: "flex", flexDirection: "column" }}>
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
                                                            icon="edit"
                                                            label="Edit"
                                                            action={() => router.push(`/stocktakingList/${stocktakingId}/${item.id}?edit=1`)}
                                                        />
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
                                    href={`/stocktakingList/${stocktakingId}/${item.id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "visible", display: "flex", flexDirection: "column" }}>
                                        {/* Bottom: Content */}
                                        <div className="p-4 gap-4 flex flex-col">
                                            {/* First part */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
                                                    <ContextButton>
                                                        <ContextRow
                                                            icon="edit"
                                                            label="Edit"
                                                            action={() => router.push(`/stocktakingList/${stocktakingId}/${item.id}?edit=1`)}
                                                        />
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
                    className="fixed left-0 right-0 bottom-0 z-[100] flex justify-center backdrop-blur-md"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.25) 100%)',
                    }}
                >
                    <div className="container flex items-center gap-2 p-4">
                        {/* Search input */}
                        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white">
                            <span className="material-icons-round text-white" style={{ fontSize: "16px" }}>search</span>
                            <input
                                type="text"
                                placeholder="Hledat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-white h-4"
                                style={{ fontSize: "16px" }}
                            />
                        </div>

                        {/* QR Button */}
                        <button
                            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer"
                            onClick={() => setIsQRModalOpen(true)}
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
                <CenteredModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="QR Sken">
                    <div style={{ display: "flex", flexDirection: "column", gap:"1rem" }}>
                        <div style={{ color: "#FF6262", fontWeight: 600 }}>
                            Položka nalezena v jiné místnosti
                        </div>
                        <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "hidden", display: "flex", flexDirection: "column", width: "100%" }}>
                            {/* Top: Image */}
                            <img
                                src={foundItem.image}
                                alt={foundItem.name}
                                style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                            />
                            {/* Bottom: Content */}
                            <div className="p-4 gap-4 flex flex-col">
                                {/* First part */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{foundItem.name}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#535353" }}>{foundItem.note}</div>
                                </div>
                                {/* Second part */}
                                <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                    Poslední kontrola 12.4.2024
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
                            <LocationPicker getter={() => currentLocation} setter={() => {}} editMode={false} />
                            <span className="material-icons-round" style={{ fontSize: 24, color: "#000" }}>arrow_downward</span>
                            <LocationPicker getter={() => newLocation} setter={() => {}} editMode={false} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            <button
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#282828",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "1rem",
                                    padding: "0.75rem",
                                    fontSize: "0.75rem",
                                    cursor: "pointer"
                                }}
                            >
                                Potvrdit změnu lokace
                                <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>check</span>
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#282828",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "1rem",
                                    padding: "0.75rem",
                                    fontSize: "0.75rem",
                                    cursor: "pointer"
                                }}
                                onClick={() => setIsQrModalOpen(false)}
                            >
                                Storno
                                <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>close</span>
                            </button>
                        </div>
                    </div>
                </CenteredModal>
                <CenteredModal isOpen={isNotInInventoryModalOpen} onClose={() => setIsNotInInventoryModalOpen(false)} title="QR Sken">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                        <div style={{ color: "#FF6262", fontWeight: 600 }}>
                            Položka není součástí inventurního seznamu.
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            <button
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#282828",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "1rem",
                                    padding: "0.75rem",
                                    fontSize: "0.75rem",
                                    cursor: "pointer"
                                }}
                            >
                                Založit novou položku
                                <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>add</span>
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#282828",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "1rem",
                                    padding: "0.75rem",
                                    fontSize: "0.75rem",
                                    cursor: "pointer"
                                }}
                                onClick={() => setIsNotInInventoryModalOpen(false)}
                            >
                                Storno
                                <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>close</span>
                            </button>
                        </div>
                    </div>
                </CenteredModal>
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
                                            onClick={() => router.push(`/stocktakingList/${stocktakingId}/${scannedItem.id}`)}
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
                                                `/stocktakingList/${stocktakingId}/new?preloadId=${scannedItem.id}`
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