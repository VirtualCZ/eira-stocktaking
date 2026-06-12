"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useStocktakingItem, useUpdateInventoryObject, useDeleteInventoryObject, useDuplicateInventoryObject } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/molecules/CenteredModal";
import ActionFeedbackModal from "@/components/molecules/ActionFeedbackModal";
import SwipeToDelete from "@/components/molecules/SwipeToDelete";
import DuplicateIdentifierModal from "@/components/molecules/DuplicateIdentifierModal";
import { useDuplicateItemModal } from "@/hooks/useDuplicateItemModal";
import { useGetLocation } from "@/hooks/useLocation";
import { mapLocationToApi } from "@/utils/inventoryItemApi";
import StocktakingItemDetailTemplate from "@/components/organisms/StocktakingItemDetailTemplate";
import Button from '@/components/atoms/Button';
import PageLoadingScreen from "@/components/atoms/PageLoadingScreen";


export default function ItemListDetail() {
    const params = useParams();
    const router = useRouter();
    const itemId = params.itemId;
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [editMode, setEditMode] = useState(false);

    const [editItem, setEditItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const bottomBarRef = useRef(null);
    const attachmentsRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);
    const [barRendered, setBarRendered] = useState(false);

    const getLocation = useGetLocation();

    const [fetchedItem, loading, error, refetchItem] = useStocktakingItem(itemId, null);
    const { updateItem, loading: updateLoading } = useUpdateInventoryObject(null);
    const { deleteItem, loading: deleteLoading } = useDeleteInventoryObject(null);
    const { duplicateItem, loading: duplicateLoading } = useDuplicateInventoryObject(null);
    const duplicateModal = useDuplicateItemModal(duplicateItem);

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

    // Show loading modal when any action is in progress
    const isAnyLoading = updateLoading || deleteLoading || duplicateLoading;

    // Helper to show modal
    const showActionModal = (title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    };

    if (loading) return <PageLoadingScreen />;
    if (error) return <PageLoadingScreen message={`Chyba: ${error.message}`} />;
    if (!fetchedItem) return <PageLoadingScreen message="Položka nenalezena" />;

    const item = { ...fetchedItem, location: editItem?.location };

    // Save handler
    const handleSave = async () => {
        if (!editItem) return;

        const origImage = originalImageRef.current ?? null;
        const curImage = editItem.image ?? null;
        const imageChanged = curImage !== origImage;

        const mainData = {
            id: editItem.id,
            name: editItem.name,
            description: editItem.description,
            note: editItem.note,
            qr: editItem.qr,
            lastCheck: editItem.date || editItem.lastCheck || null,
            state: editItem.state,
            location: mapLocationToApi(editItem.location),
        };
        if (editItem.eventId != null && editItem.eventId !== undefined) {
            mainData.eventId = editItem.eventId;
        }
        mainData.imgChanged = imageChanged;
        if (imageChanged) {
            mainData.image = editItem.image;
        }

        const result = await updateItem(mainData);
        if (result) {
            try {
                await attachmentsRef.current?.commitPending?.();
            } catch (e) {
                showActionModal('Chyba', e?.message || 'Přílohy se nepodařilo uložit.', false);
                return;
            }
            setEditMode(false);
            showActionModal('Hotovo', 'Položka byla úspěšně upravena.', true);
            if (refetchItem) refetchItem();
        } else {
            showActionModal('Chyba', 'Nepodařilo se upravit položku.', false);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
    };

    const handleDuplicateConfirm = async (code) => {
        const { ok, newId } = await duplicateModal.confirm(code, item?.id);
        if (newId) {
            showActionModal('Hotovo', 'Položka byla úspěšně duplikována.', true);
            const path = `/itemList/${newId}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
            router.push(path);
        } else if (ok) {
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
                onDuplicate={duplicateModal.open}
                onSave={handleSave}
                showMove={false}
                showFoundActions={false}
                loading={loading}
                error={error}
                returnTo={returnTo}
                isDeleteModalOpen={isDeleteModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                bottomPadding={bottomPadding}
                setBottomPadding={setBottomPadding}
                barRendered={barRendered}
                setBarRendered={setBarRendered}
                showInventoryDetails={false}
                attachmentsRef={attachmentsRef}
            />
            {/* Action result modal for update, delete, duplicate */}
            <ActionFeedbackModal
                isOpen={actionModalOpen}
                onClose={() => setActionModalOpen(false)}
                title={actionModalContent.title}
                message={actionModalContent.message}
                success={actionModalContent.success}
            />
            {/* Loading modal for any action */}
            <CenteredModal isOpen={isAnyLoading} title="Probíhá akce...">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <span>Probíhá akce...</span>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
            </CenteredModal>
            <DuplicateIdentifierModal
                isOpen={duplicateModal.isOpen}
                onClose={duplicateModal.close}
                originalCode={item?.qr}
                onConfirm={handleDuplicateConfirm}
                loading={duplicateLoading}
            />
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
                        <Button variant="secondary" icon="close" iconPosition="right" style={{ fontSize: "0.75rem" }} onClick={handleCancelEdit}>
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
