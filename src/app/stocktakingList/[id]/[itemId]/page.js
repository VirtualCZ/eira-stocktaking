"use client";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStocktakingItem } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/CenteredModal";
import SwipeToDelete from "@/components/SwipeToDelete";
import { useGetLocation } from "@/hooks/useLocation";
import StocktakingItemDetailTemplate from "@/components/organisms/StocktakingItemDetailTemplate";
import Button from '../../../../components/inputs/Button';

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

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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
        <>
            <StocktakingItemDetailTemplate
                item={item}
                editItem={editItem}
                editMode={editMode}
                onEditItemChange={setEditItem}
                onEditModeChange={() => setEditMode(!editMode)}
                onDelete={() => setIsDeleteModalOpen(true)}
                onDuplicate={() => alert('Duplicate clicked')}
                onSave={() => {/* Save logic here */}}
                showMove={true}
                showFound={true}
                loading={loading}
                error={error}
                returnTo={returnTo}
                isDeleteModalOpen={isDeleteModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                bottomPadding={bottomPadding}
                setBottomPadding={setBottomPadding}
                barRendered={barRendered}
                setBarRendered={setBarRendered}
            />
            <CenteredModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} title="Chyba">
                <div style={{ color: '#FF6262', fontWeight: 600, fontSize: 16 }}>{errorMessage}</div>
            </CenteredModal>
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
                        <Button variant="secondary" icon="close" iconPosition="right" style={{ fontSize: "0.75rem" }} onClick={() => setEditMode(false)}>
                            Zrušit úpravy
                        </Button>
                        <Button icon="check" iconPosition="right" style={{ fontSize: "0.75rem" }} onClick={() => {
                            if (!editItem) return;
                            // Check for empty property keys
                            let propertiesArr = Array.isArray(editItem.properties)
                                ? editItem.properties
                                : Object.entries(editItem.properties || {}).map(([key, value]) => ({ key, value }));
                            if (propertiesArr.some(p => !p.key || p.key.trim() === "")) {
                                setErrorMessage("Všechny pole 'Vlastnost' musí být vyplněné.");
                                setErrorModalOpen(true);
                                return;
                            }
                            const data = {
                                image: editItem.image,
                                name: editItem.name,
                                description: editItem.description,
                                note: editItem.note,
                                location: editItem.location,
                                qr: editItem.qrCode,
                                properties: editItem.properties,
                                id: editItem.id,
                                date: editItem.date || editItem.lastCheck || null
                            };
                            console.log('ULOZIT ZMENY DATA:', data);
                        }}>
                            Uložit změny
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
} 