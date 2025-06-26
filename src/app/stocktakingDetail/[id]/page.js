"use client";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchStocktaking } from "@/mockApi";
import PictureInput from "@/components/PictureInput";

import CardContainer from "@/components/CardContainer";
import DetailCardRow from "@/components/DetailCardRow";
import { ContextButton, ContextRow } from "@/components/ContextMenu";
import Link from "next/link";
import CenteredModal from "@/components/CenteredModal";
import SwipeToDelete from "@/components/SwipeToDelete";
import LocationPicker from "@/components/LocationPicker";
import { useGetLocation } from "@/hooks/useLocation";
import TextInput from "@/components/TextInput";

export default function StocktakingDetail() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [editItem, setEditItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);
    const [barJustRendered, setBarJustRendered] = useState(false);
    const [barRendered, setBarRendered] = useState(false);

    const getLocation = useGetLocation();

    useEffect(() => {
        setLoading(true);
        fetchStocktaking({ offset: Number(id) - 1, limit: 1 }).then(res => {
            const fetched = res.items[0];
            // Map API location fields to Czech field names
            const mappedLoc = fetched.location
                ? {
                    budova: fetched.location.building,
                    podlazi: fetched.location.story,
                    mistnost: fetched.location.room,
                }
                : null;
            setItem({ ...fetched, location: mappedLoc });
            setEditItem({ ...fetched, location: mappedLoc });
            setLoading(false);
        });
    }, [id]);

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

    useLayoutEffect(() => {
        if (editMode) {
            setBarJustRendered(true);
        }
    }, [editMode]);

    useLayoutEffect(() => {
        if (barJustRendered && bottomBarRef.current) {
            setBottomPadding(bottomBarRef.current.offsetHeight);
            setBarJustRendered(false);
        }
    }, [barJustRendered]);

    useLayoutEffect(() => {
        const updatePadding = () => {
            if (bottomBarRef.current) {
                const height = bottomBarRef.current.offsetHeight;
                console.log('Bottom bar ref present, height:', height);
                setBottomPadding(height);
            } else {
                console.log('Bottom bar ref NOT present');
                setBottomPadding(0);
            }
        };
    
        updatePadding(); // initial call
    
        const observer = new MutationObserver(() => {
            updatePadding(); // recheck when DOM mutates
        });
    
        if (bottomBarRef.current) {
            observer.observe(bottomBarRef.current, { attributes: true, childList: true, subtree: true });
        }
    
        window.addEventListener("resize", updatePadding);
    
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updatePadding);
        };
    }, [editMode, bottomBarRef.current]);

    useEffect(() => {
        if (!editMode) setBarRendered(false);
    }, [editMode]);

    useEffect(() => {
        if (editMode && barRendered && bottomBarRef.current) {
            setBottomPadding(bottomBarRef.current.offsetHeight);
        }
    }, [editMode, barRendered]);

    useEffect(() => {
        console.log('editMode:', editMode);
    }, [editMode]);

    if (loading) return <div style={{ padding: 32 }}>Načítání...</div>;
    if (!item) return <div style={{ padding: 32 }}>Položka nenalezena</div>;

    return (
        <div className="relative min-h-screen flex flex-col" style={{}}>
            {/* Floating nav button */}
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#535353' }}>
                                    <TextInput
                                        value={editItem.note}
                                        onChange={e => setEditItem({ ...editItem, note: e.target.value })}
                                        label={"Poznámka"}
                                        placeholder="Poznámka"
                                        multiline
                                    />
                                </div>
                                <LocationPicker
                                    getter={() => editItem.location}
                                    setter={loc => setEditItem(prev => ({ ...prev, location: loc }))}
                                    editMode={true}
                                />
                                <CardContainer>
                                    <TextInput value={editItem.weight || ''} onChange={e => setEditItem({ ...editItem, weight: e.target.value })} label={"Váha"} placeholder="30kg" />
                                    <TextInput value={editItem.size || ''} onChange={e => setEditItem({ ...editItem, size: e.target.value })} label={"Velikost"} placeholder="10*20*30cm" />
                                    <TextInput value={editItem.price || ''} onChange={e => setEditItem({ ...editItem, price: e.target.value })} label={"Cena"} placeholder="1234,-" />
                                </CardContainer>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                                    <div>Poslední úprava {item.lastCheck}</div>
                                    <div>ID {item.id}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <PictureInput value={item.image || ""} editMode={false} />
                            <div className="p-4 flex flex-col gap-4">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
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
                                                action={() => setIsDeleteModalOpen(true)}
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
                                <LocationPicker
                                    getter={() => editItem.location}
                                    setter={() => {}}
                                    editMode={false}
                                />
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