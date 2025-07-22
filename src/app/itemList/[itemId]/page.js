"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStocktakingItem, useUpdateStocktakingItem, useDeleteStocktakingItem, useDuplicateStocktakingItem } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/molecules/CenteredModal";
import SwipeToDelete from "@/components/molecules/SwipeToDelete";
import { useGetLocation } from "@/hooks/useLocation";
import StocktakingItemDetailTemplate from "@/components/organisms/StocktakingItemDetailTemplate";
import Button from '@/components/atoms/Button';

export default function ItemListDetail() {
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

    const [fetchedItem, loading, error, refetchItem] = useStocktakingItem(itemId);
    const { updateItem, loading: updateLoading, error: updateError, success: updateSuccess } = useUpdateStocktakingItem();
    const { deleteItem, loading: deleteLoading, error: deleteError, success: deleteSuccess } = useDeleteStocktakingItem();
    const { duplicateItem, loading: duplicateLoading, error: duplicateError, success: duplicateSuccess } = useDuplicateStocktakingItem();

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: '', message: '', success: false });

    // Store the original image for comparison
    const originalImageRef = useRef(null);
    useEffect(() => {
        if (fetchedItem) {
            originalImageRef.current = fetchedItem.image || null;
        }
    }, [fetchedItem]);

    useEffect(() => {
        if (fetchedItem) {
            const mappedLoc = fetchedItem.location
                ? {
                    building: fetchedItem.location.building,
                    storey: fetchedItem.location.storey,
                    room: fetchedItem.location.room,
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

    // Show modals based on hook states
    useEffect(() => {
        if (updateSuccess) {
            showActionModal('Hotovo', 'Položka byla úspěšně upravena.', true);
        } else if (updateError) {
            showActionModal('Chyba', updateError?.message || 'Nepodařilo se upravit položku.', false);
        }
    }, [updateSuccess, updateError]);

    useEffect(() => {
        if (duplicateSuccess) {
            showActionModal('Hotovo', 'Položka byla úspěšně duplikována.', true);
        } else if (duplicateError) {
            showActionModal('Chyba', duplicateError?.message || 'Nepodařilo se duplikovat položku.', false);
        }
    }, [duplicateSuccess, duplicateError]);

    useEffect(() => {
        if (deleteSuccess) {
            showActionModal('Hotovo', 'Položka byla úspěšně smazána.', true);
        } else if (deleteError) {
            showActionModal('Chyba', deleteError?.message || 'Nepodařilo se smazat položku.', false);
        }
    }, [deleteSuccess, deleteError]);

    // Show loading modal when any action is in progress
    const isAnyLoading = updateLoading || deleteLoading || duplicateLoading;

    // Helper to show modal
    const showActionModal = (title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    };

    if (loading) return <div style={{ padding: 32 }}>Načítání...</div>;
    if (error) return <div style={{ padding: 32 }}>Chyba: {error.message}</div>;
    if (!fetchedItem) return <div style={{ padding: 32 }}>Položka nenalezena</div>;

    const item = { ...fetchedItem, location: editItem?.location };

    // Helper to convert properties array to object
    function propertiesArrayToObject(propertiesArr) {
        const obj = {};
        for (const prop of propertiesArr || []) {
            if ((prop.key || prop.name) && (prop.key || prop.name).trim() !== "") {
                obj[prop.key || prop.name] = prop.value;
            }
        }
        return obj;
    }

    // Helper to map location fields to API format
    function mapLocationToApi(location) {
        if (!location) return undefined;
        return {
            building: location.building ?? 0,
            storey: location.storey ?? 0,
            room: location.room ?? 0,
        };
    }

    // Save handler
    const handleSave = async () => {
        if (!editItem) return;
        const originalImage = originalImageRef.current;
        const currentImage = editItem.image || null;
        let imgChanged = currentImage !== originalImage;
        let imgField = undefined;
        if (imgChanged) {
            imgField = currentImage; // can be null (deleted) or new image data
        }
        let propertiesArr = Array.isArray(editItem.properties)
            ? editItem.properties
            : Object.entries(editItem.properties || {}).map(([key, value]) => ({ key, value }));
        if (propertiesArr.some(p => !(p.key || p.name) || (p.key || p.name).trim() === "")) {
            setErrorMessage("Všechny pole 'Vlastnost' musí být vyplněné.");
            setErrorModalOpen(true);
            return;
        }
        const mainData = {
            id: editItem.id,
            name: editItem.name,
            description: editItem.description,
            note: editItem.note,
            location: mapLocationToApi(editItem.location),
            qr: editItem.qr,
            properties: propertiesArrayToObject(propertiesArr),
            lastCheck: editItem.date || editItem.lastCheck || null,
            state: editItem.state,
            imgChanged,
        };
        // If imgField is a File object, ignore for now and send null. Only send string path or null.
        if (imgChanged) {
            if (typeof imgField === 'string') {
                mainData.image = imgField;
            } else if (imgField instanceof File) {
                mainData.image = imgField.name;
            } else {
                mainData.image = null;
            }
            console.log('Sending image path:', mainData.image);
        }
        const result = await updateItem(mainData);
        if(result) {
            setEditMode(false);
            showActionModal('Hotovo', 'Položka byla úspěšně upravena.', true);
            if (refetchItem) refetchItem();
        } else {
            showActionModal('Chyba', 'Nepodařilo se upravit položku.', false);
        }
    };

    // Duplicate handler
    const handleDuplicate = async () => {
        if (!editItem) return;
        const result = await duplicateItem(editItem.id);
        if(result) {
            showActionModal('Hotovo', 'Položka byla úspěšně duplikována.', true);
        } else {
            showActionModal('Chyba', 'Nepodařilo se duplikovat položku.', false);
        }
    };

    // Delete handler
    const handleDelete = async () => {
        if (!editItem) return;
        const result = await deleteItem(editItem.id);
        if(result) {
            showActionModal('Hotovo', 'Položka byla úspěšně smazána.', true);
        } else {
            showActionModal('Chyba', 'Nepodařilo se smazat položku.', false);
        }
    };

    return (
        <>
            <StocktakingItemDetailTemplate
                item={item}
                editItem={editItem}
                editMode={editMode}
                onEditItemChange={setEditItem}
                onEditModeChange={() => setEditMode(!editMode)}
                onDelete={() => setIsDeleteModalOpen(true)}
                onDuplicate={handleDuplicate}
                onSave={handleSave}
                showMove={false}
                showFound={false}
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
            <CenteredModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} title={updateSuccess ? "Hotovo" : "Chyba"}>
                <div style={{ color: updateSuccess ? '#2ecc40' : '#FF6262', fontWeight: 600, fontSize: 16 }}>{errorMessage}</div>
            </CenteredModal>
            {/* Action result modal for update, delete, duplicate */}
            <CenteredModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={actionModalContent.title}>
                <div style={{ color: actionModalContent.success ? '#2ecc40' : '#FF6262', fontWeight: 600, fontSize: 16 }}>{actionModalContent.message}</div>
            </CenteredModal>
            {/* Loading modal for any action */}
            <CenteredModal isOpen={isAnyLoading} title="Probíhá akce...">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <span>Probíhá akce...</span>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
            </CenteredModal>
            {/* Delete Confirmation Modal */}
            <CenteredModal title={"Opravdu chcete smazat předmět?"} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: 12, fontStyle: 'italic' }}>Tuto operaci nelze vrátit!</div>
                    <SwipeToDelete onConfirm={async () => {
                        setIsDeleteModalOpen(false);
                        await handleDelete();
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
                        <Button icon="check" iconPosition="right" style={{ fontSize: "0.75rem" }} onClick={handleSave}>
                            Uložit změny
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
} 