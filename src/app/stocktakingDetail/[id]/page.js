"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchStocktaking } from "@/mockApi";
import Button from "@/components/Button";
import PictureInput from "@/components/PictureInput";
import TextInput from "@/components/TextInput";
import Modal from "@/components/Modal";
import PageHeading from "@/components/PageHeading";
import LocationPickerModal from "@/components/LocationPickerModal";
import LocationNavCard from "@/components/LocationNavCard";
import CardContainer from "@/components/CardContainer";
import DetailCardRow from "@/components/DetailCardRow";
import { ContextButton, ContextRow } from "@/components/ContextMenu";

export default function StocktakingDetail() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [colorPopover, setColorPopover] = useState({ open: false, idx: null, anchor: null });
    const COLORS = ["blue", "silver", "white", "black", "gray", "red"];
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchStocktaking({ offset: Number(id) - 1, limit: 1 }).then(res => {
            setItem(res.items[0]);
            setEditItem(res.items[0]);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div style={{ padding: 32 }}>Načítání...</div>;
    if (!item) return <div style={{ padding: 32 }}>Položka nenalezena</div>;

    return (
        <div className="relative min-h-screen flex flex-col" style={{}}>
            <main className="flex flex-col items-center" style={{ minHeight: "100vh" }}>
                <PageHeading heading="Detail položky" route={returnTo} />
                {editMode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <PictureInput label="Fotka" value={editItem.image || ""} onChange={img => setEditItem({ ...editItem, image: img })} />
                        <TextInput label="Název" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
                        <TextInput label="Cena" value={editItem.price || ""} onChange={e => setEditItem({ ...editItem, price: e.target.value })} />
                        <TextInput label="Poznámka" value={editItem.note} onChange={e => setEditItem({ ...editItem, note: e.target.value })} />
                        <div>
                            {/* <Button type="button" onClick={() => setModalOpen(true)}>Upravit lokaci</Button> */}
                            {editItem.location && (
                                <div className="text-sm text-gray-600">
                                    Budova {editItem.location.budova}<br />Podlaží {editItem.location.podlazi}<br />Místnost {editItem.location.mistnost}
                                </div>
                            )}
                        </div>
                        <LocationPickerModal
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            onSave={loc => setEditItem({ ...editItem, location: loc })}
                            initialLocation={editItem.location}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <b>Barvy:</b>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                {editItem.colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "0.5rem",
                                            background: color,
                                            border: "1px solid #F0F0F0",
                                            cursor: "pointer",
                                            padding: 0,
                                            margin: 0,
                                            transition: "transform 0.15s"
                                        }}
                                        className="hover:scale-110"
                                        title={color}
                                        onClick={e => setColorPopover({ open: true, idx, anchor: e.target, mode: "edit" })}
                                    ></button>
                                ))}
                                <button
                                    type="button"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 32,
                                        height: 32,
                                        borderRadius: "0.5rem",
                                        background: "#F0F0F0",
                                        border: "1px solid #F0F0F0",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        fontSize: 16,
                                        padding: 0,
                                        margin: 0,
                                        transition: "background 0.15s"
                                    }}
                                    className="hover:bg-gray-200"
                                    title="Přidat barvu"
                                    onClick={e => setColorPopover({ open: true, idx: null, anchor: e.target, mode: "add" })}
                                >+</button>
                            </div>
                            <Modal
                                isOpen={colorPopover.open}
                                onClose={() => setColorPopover({ open: false })}
                                title="Vyberte barvu"
                                height="40vh"
                            >
                                <ul style={{ margin: 0, padding: "1rem", listStyle: "none", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {COLORS.map(c => {
                                        const isDuplicate = colorPopover.mode === "add" && editItem.colors.includes(c);
                                        return (
                                            <li key={c}>
                                                <button
                                                    type="button"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "0.5rem",
                                                        background: isDuplicate ? "#e0e0e0" : c,
                                                        border: "1px solid #F0F0F0",
                                                        cursor: isDuplicate ? "not-allowed" : "pointer",
                                                        outline: 'none',
                                                        boxShadow: 'none',
                                                        transition: "transform 0.15s",
                                                        position: "relative",
                                                        opacity: isDuplicate ? 0.6 : 1
                                                    }}
                                                    className={isDuplicate ? "" : "hover:scale-110"}
                                                    disabled={isDuplicate}
                                                    onClick={() => {
                                                        if (isDuplicate) return;

                                                        if (colorPopover.mode === "edit") {
                                                            const newColors = [...editItem.colors];
                                                            newColors[colorPopover.idx] = c;
                                                            setEditItem({ ...editItem, colors: newColors });
                                                        } else {
                                                            setEditItem({ ...editItem, colors: [...editItem.colors, c] });
                                                        }
                                                        setColorPopover({ open: false, idx: null, anchor: null, mode: null });
                                                    }}
                                                >
                                                    {isDuplicate && (
                                                        <div style={{
                                                            position: "absolute",
                                                            top: "50%",
                                                            left: "50%",
                                                            width: "120%",
                                                            height: "2px",
                                                            backgroundColor: "#ff0000",
                                                            transform: "translate(-50%, -50%) rotate(-45deg)",
                                                            transformOrigin: "center"
                                                        }} />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {colorPopover.mode === "edit" && (
                                    <div style={{ borderTop: "1px solid #F0F0F0", margin: "0 1rem" }} />
                                )}
                                {colorPopover.mode === "edit" && (
                                    <button
                                        type="button"
                                        style={{
                                            textDecoration: "none",
                                            color: "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "1rem",
                                            gap: "1rem",
                                            fontWeight: 600,
                                            fontSize: "1rem",
                                            transition: "background 0.15s",
                                            borderRadius: "0.5rem",
                                            color: "#e00",
                                            width: "100%",
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            textAlign: "left"
                                        }}
                                        className="transition-opacity hover:opacity-50 active:opacity-50 focus:opacity-50"
                                        onClick={() => {
                                            const newColors = editItem.colors.filter((_, i) => i !== colorPopover.idx);
                                            setEditItem({ ...editItem, colors: newColors });
                                            setColorPopover({ open: false, idx: null, anchor: null, mode: null });
                                        }}
                                    >
                                        <span className="material-icons-round" style={{ fontSize: "2rem", color: "#e00" }}>
                                            delete
                                        </span>
                                        <span>Odstranit barvu</span>
                                    </button>
                                )}
                            </Modal>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col container" style={{}}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: 280, objectFit: "contain", borderRadius: 12, alignSelf: "center" }} />
                        <div className="p-4 flex flex-col gap-4">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>Kancelářská židle z obchodu abcd</span>
                                    <ContextButton>
                                        <ContextRow
                                            icon="edit"
                                            label="Edit"
                                            action={() => setEditMode(!editMode)}
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
                            <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#535353' }}>
                                <div style={{ fontWeight: 500, fontSize: 12 }}>Poznámka:</div>
                                <div style={{ fontStyle: 'italic', fontSize: 12 }}>{item.note}</div>
                            </div>
                            <LocationNavCard />
                            <CardContainer>
                                <DetailCardRow label="Váha:" value="2kg" />
                                <DetailCardRow label="Velikost:" value="50x40x50cm" />
                                <DetailCardRow label="Cena:" value="1 234,-" />
                            </CardContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                                <div>Poslední úprava {item.lastCheck}</div>
                                <div>ID {item.id}</div>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? "Zrušit úpravy" : "Upravit"}
                    </Button>

                    {editMode && (
                        <Button
                            onClick={() => { }}
                        >
                            Uložit změny
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}