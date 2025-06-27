"use client";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStocktakingItem } from "@/hooks/useStocktakingItems";
import PictureInput from "@/components/PictureInput";
import CardContainer from "@/components/CardContainer";
import DetailCardRow from "@/components/DetailCardRow";
import { ContextButton, ContextRow } from "@/components/ContextMenu";
import Link from "next/link";
import CenteredModal from "@/components/CenteredModal";
import SwipeToDelete from "@/components/SwipeToDelete";
import LocationPicker from "@/components/organisms/LocationPicker";
import { useGetLocation } from "@/hooks/useLocation";
import QRCodeInput from "@/components/QRCodeInput";
import TextInput from "@/components/inputs/TextInput";
import CardItemName from "@/components/molecules/CardItemName";
import CardItemNote from "@/components/molecules/CardItemNote";
import CardItemDescription from "@/components/molecules/CardItemDescription";

export default function StocktakingListItemDetail() {
    const params = useParams();
    const itemId = params.itemId;
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [editMode, setEditMode] = useState(false);

    const [editItem, setEditItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);
    const [barRendered, setBarRendered] = useState(false);

    const getLocation = useGetLocation();

    const [fetchedItem, loading, error] = useStocktakingItem(itemId);

    // Map API location fields to Czech field names and set item state
    useEffect(() => {
        if (fetchedItem) {
            const mappedLoc = fetchedItem.location
                ? {
                    budova: fetchedItem.location.building,
                    podlazi: fetchedItem.location.story,
                    mistnost: fetchedItem.location.room,
                }
                : null;
            const itemWithMappedLocation = { ...fetchedItem, location: mappedLoc };
            setEditItem(itemWithMappedLocation);
        }
    }, [fetchedItem]);

    useEffect(() => {
        if (searchParams.get('edit') === '1') {
            setEditMode(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (editMode && editItem && !editItem.location) {
            const userLoc = getLocation();
            if (userLoc) {
                setEditItem(prev => ({ ...prev, location: userLoc }));
            }
        }
    }, [editMode, editItem, getLocation]);

    useEffect(() => {
        if (!editMode) setBarRendered(false);
    }, [editMode]);

    useEffect(() => {
        if (editMode && barRendered && bottomBarRef.current) {
            setBottomPadding(bottomBarRef.current.offsetHeight);
        }
    }, [editMode, barRendered]);

    if (loading) return <div style={{ padding: 32 }}>Načítání...</div>;
    if (error) return <div style={{ padding: 32 }}>Chyba: {error.message}</div>;
    if (!fetchedItem) return <div style={{ padding: 32 }}>Položka nenalezena</div>;

    const item = { ...fetchedItem, location: editItem?.location };

    return (
        <div className="relative min-h-screen flex flex-col" style={{}}>
            <main className="flex flex-col items-center" style={{ minHeight: "100vh", paddingBottom: bottomPadding }}>
                <div className="flex flex-col container" style={{}}>
                    <Link
                        href={returnTo}
                        style={{
                            position: "absolute",
                            marginTop: "1rem",
                            marginLeft: "1rem",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: 16,
                            width: 38,
                            height: 38,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1100,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            textDecoration: "none"
                        }}
                    >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>
                            {returnTo === "/" ? "home" : "arrow_back"}
                        </span>
                    </Link>
                    {editMode ? (
                        <>
                            {editItem && (
                                <>
                                    <PictureInput value={editItem.image || ""} onChange={img => setEditItem({ ...editItem, image: img })} editMode={true} />
                                    <div className="p-4 flex flex-col gap-4">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <TextInput
                                                    value={editItem.name}
                                                    onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                                    label={"Název"}
                                                    placeholder="Název"
                                                />
                                            </div>
                                            <TextInput
                                                value={editItem.note}
                                                onChange={e => setEditItem({ ...editItem, note: e.target.value })}
                                                label={"Popisek"}
                                                placeholder="Popisek"
                                            />
                                        </div>
                                        <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                                        <TextInput
                                            value={editItem.note}
                                            onChange={e => setEditItem({ ...editItem, note: e.target.value })}
                                            label={"Poznámka"}
                                            placeholder="Poznámka"
                                            multiline
                                        />
                                        <LocationPicker
                                            value={editItem.location}
                                            onChange={loc => setEditItem(prev => ({ ...prev, location: loc }))}
                                            editMode={true}
                                        />
                                        <QRCodeInput
                                            value={editItem.qrCode}
                                            onChange={code => {
                                                console.log('Scanned QR code:', code);
                                                setEditItem(prev => ({ ...prev, qrCode: code }));
                                            }}
                                            editMode={true}
                                        />
                                        {/* Dynamic properties editing */}
                                        {editItem.properties && typeof editItem.properties === 'object' && (
                                            <CardContainer className="gap-2">
                                                {Object.entries(editItem.properties).map(([key, value], idx, arr) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                        <TextInput
                                                            value={key}
                                                            onChange={e => {
                                                                const newKey = e.target.value;
                                                                const newProps = { ...editItem.properties };
                                                                if (newKey !== key) {
                                                                    if (newKey && !newProps[newKey]) {
                                                                        newProps[newKey] = newProps[key];
                                                                        delete newProps[key];
                                                                    } else if (!newKey) {
                                                                        delete newProps[key];
                                                                        newProps[""] = value;
                                                                    }
                                                                    setEditItem({ ...editItem, properties: newProps });
                                                                }
                                                            }}
                                                            label={idx === 0 ? "Vlastnost" : undefined}
                                                            placeholder="Název"
                                                        />
                                                        <TextInput
                                                            value={value}
                                                            onChange={e => {
                                                                const newProps = { ...editItem.properties, [key]: e.target.value };
                                                                setEditItem({ ...editItem, properties: newProps });
                                                            }}
                                                            label={idx === 0 ? "Hodnota" : undefined}
                                                            placeholder="Hodnota"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newProps = { ...editItem.properties };
                                                                delete newProps[key];
                                                                setEditItem({ ...editItem, properties: newProps });
                                                            }}
                                                            style={{
                                                                borderRadius: "0.5rem",
                                                                padding: "0.75rem",
                                                                border: "none",
                                                                background: "#FF6262",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                cursor: "pointer",
                                                                marginTop: 8
                                                            }}
                                                            title="Odebrat"
                                                            className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
                                                        >
                                                            <span className="material-icons-round" style={{ color: "#000", fontSize: 16 }}>delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Add a new empty property (find a unique key)
                                                        let i = 1;
                                                        let newKey = "";
                                                        while (true) {
                                                            newKey = `Vlastnost${i}`;
                                                            if (!editItem.properties[newKey]) break;
                                                            i++;
                                                        }
                                                        setEditItem({
                                                            ...editItem,
                                                            properties: { ...editItem.properties, [newKey]: "" }
                                                        });
                                                    }}
                                                    className="flex items-center gap-2 rounded-lg bg-[#282828] p-3 text-white border-none cursor-pointer mt-2"
                                                    style={{ fontSize: "0.75rem" }}
                                                >
                                                    <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>add</span>
                                                    Přidat vlastnost
                                                </button>
                                            </CardContainer>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                                            <div>Poslední úprava {item.lastCheck}</div>
                                            <div>ID {item.id}</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <PictureInput value={item.image || ""} editMode={false} />
                            <div className="p-4 flex flex-col gap-4">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <CardItemName>{item.name}</CardItemName>
                                        <ContextButton>
                                            <ContextRow
                                                icon="edit"
                                                label="Upravit"
                                                action={() => setEditMode(!editMode)}
                                            />
                                            <ContextRow
                                                icon="content_copy"
                                                label="Duplikovat"
                                                action={() => alert('Duplicate clicked')}
                                            />
                                            <ContextRow
                                                icon="delete"
                                                label="Smazat"
                                                action={() => setIsDeleteModalOpen(true)}
                                                color="#FF6262"
                                            />
                                            <ContextRow
                                                icon="swap_horiz"
                                                label="Přesun"
                                                action={() => { }}
                                            />
                                            <ContextRow
                                                icon="visibility"
                                                label="Nalezeno"
                                                action={() => { }}
                                            />
                                        </ContextButton>
                                    </div>
                                    <CardItemDescription>{item.description}</CardItemDescription>
                                </div>
                                <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                                <CardItemNote>{item.note}</CardItemNote>
                                <LocationPicker
                                    value={item.location}
                                    editMode={false}
                                />
                                <QRCodeInput
                                    value={item.qrCode}
                                    onChange={() => { }}
                                    editMode={false}
                                />
                                {item.properties && typeof item.properties === 'object' && (
                                    <CardContainer className="gap-2">
                                        {Object.entries(item.properties).map(([key, value]) => (
                                            <DetailCardRow key={key} label={key + ':'} value={value} />
                                        ))}
                                    </CardContainer>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                                    <div>Poslední úprava {item.lastCheck}</div>
                                    <div>ID {item.id}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </main>
            {/* Delete Confirmation Modal */}
            <CenteredModal title={"Opravdu chcete smazat předmět?"} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: 12, fontStyle: 'italic' }}>Tuto operaci nelze vrátit!</div>
                    <SwipeToDelete onConfirm={() => {
                        alert('Item deleted!');
                        setIsDeleteModalOpen(false);
                    }} />
                </div>
            </CenteredModal>
            {editMode && (
                <div
                    ref={el => {
                        bottomBarRef.current = el;
                        if (el) {
                            setBarRendered(true);
                        }
                    }}
                    className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
                    style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)',
                    }}
                >
                    <div className="container flex items-center gap-2 p-4 justify-center">
                        <button
                            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => setEditMode(false)}
                        >
                            Zrušit úpravy
                            <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>close</span>
                        </button>
                        <button
                            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
                            onClick={() => { /* Save logic here */ }}
                            style={{ fontSize: "0.75rem" }}
                        >
                            Uložit změny
                            <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>check</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 