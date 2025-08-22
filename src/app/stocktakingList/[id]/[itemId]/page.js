"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStocktakingItem, useUpdateStocktakingItem, useDeleteStocktakingItem, useDuplicateStocktakingItem } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/molecules/CenteredModal";
import SwipeToDelete from "@/components/molecules/SwipeToDelete";
import { useGetLocation } from "@/hooks/useLocation";
import StocktakingItemDetailTemplate from "@/components/organisms/StocktakingItemDetailTemplate";
import Button from '@/components/atoms/Button';
import LocationPicker from "@/components/organisms/LocationPicker";
import CardItemName from "@/components/atoms/CardItemName";


export default function StocktakingListItemDetail() {
    const params = useParams();
    const stocktakingId = parseInt(params.id);
    const itemId = parseInt(params.itemId);
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [editMode, setEditMode] = useState(false);

    const [editItem, setEditItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveNewLocation, setMoveNewLocation] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);
    const [barRendered, setBarRendered] = useState(false);

    const getLocation = useGetLocation();

    const [fetchedItem, loading, error, refetchItem] = useStocktakingItem(itemId, stocktakingId);
    const { updateItem, loading: updateLoading, error: updateError, success: updateSuccess } = useUpdateStocktakingItem(stocktakingId);
    const { deleteItem, loading: deleteLoading, error: deleteError, success: deleteSuccess } = useDeleteStocktakingItem(stocktakingId);
    const { duplicateItem, loading: duplicateLoading, error: duplicateError, success: duplicateSuccess } = useDuplicateStocktakingItem(stocktakingId);

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

    // Map API location fields to Czech field names and set item state
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

    if (loading) return <div style={{ padding: 32 }}>Načítání...</div>;
    if (error) return <div style={{ padding: 32 }}>Chyba: {error.message}</div>;
    if (!fetchedItem) return <div style={{ padding: 32 }}>Položka nenalezena</div>;

    const item = { ...fetchedItem, location: editItem?.location };

    const handleFound = async () => {
        if (!item) return;
        const { image, ...rest } = item;
        const result = await updateItem({ ...rest, stocktakingId: stocktakingId, state: 'nalezeno' });
        if(result) {
            showActionModal('Hotovo', 'Položka byla označena jako nalezena.', true);
            if (refetchItem) refetchItem();
        } else {
            showActionModal('Chyba', 'Nepodařilo se označit položku jako nalezenou.', false);
        }
    };

    const handleMoveConfirm = async () => {
        if (!item || !moveNewLocation) return;
        const { image, ...rest } = item;
        const result = await updateItem({ ...rest, stocktakingId: stocktakingId, location: mapLocationToApi(moveNewLocation), state: 'presun' });
        setIsMoveModalOpen(false);
        if(result) {
            showActionModal('Hotovo', 'Položka byla přesunuta.', true);
            if (refetchItem) refetchItem();
        } else {
            showActionModal('Chyba', 'Nepodařilo se přesunout položku.', false);
        }
    };

    const openMoveModal = () => {
        setMoveNewLocation(item.location);
        setIsMoveModalOpen(true);
    };

    // Helper to convert properties array to object
    function propertiesArrayToObject(propertiesArr) {
        const obj = {};
        for (const prop of propertiesArr || []) {
            // For API-defined properties, use metaCode as key if available, otherwise use label
            if (prop.fieldType) {
                const key = prop.metaCode || prop.label;
                if (key && prop.value !== undefined && prop.value !== null && prop.value.toString().trim() !== "") {
                    obj[key] = prop.value;
                }
            } else if ((prop.key || prop.name) && (prop.key || prop.name).trim() !== "") {
                // For custom properties, use the old format
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
        
        // Validate properties - for API-defined properties, only check if value exists
        if (propertiesArr.some(p => {
            // For API-defined properties, only value is required
            if (p.fieldType) {
                return !p.value || p.value.toString().trim() === "";
            }
            // For custom properties, both key and value are required
            return !(p.key || p.name) || (p.key || p.name).trim() === "" || !p.value || p.value.toString().trim() === "";
        })) {
            setErrorMessage("Všechny pole 'Hodnota' musí být vyplněné.");
            setErrorModalOpen(true);
            return;
        }
        
        const mainData = {
            id: editItem.id,
            stocktakingId: stocktakingId,
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
        // Convert File objects to base64 data for backend processing
        if (imgChanged) {
            if (typeof imgField === 'string') {
                // If it's already a base64 string, use it directly
                if (imgField.startsWith('data:image/')) {
                    mainData.image = imgField;
                } else {
                    mainData.image = imgField;
                }
            } else if (imgField instanceof File) {
                // Convert File to base64
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64Data = reader.result;
                    mainData.image = base64Data;
                    console.log('Sending image as base64 data');
                    
                    // Send the update with base64 image data
                    const result = await updateItem(mainData);
                    if(result) {
                        setEditMode(false);
                        showActionModal('Hotovo', 'Položka byla úspěšně upravena.', true);
                        if (refetchItem) refetchItem();
                    } else {
                        showActionModal('Chyba', 'Nepodařilo se upravit položku.', false);
                    }
                };
                reader.readAsDataURL(imgField);
                return; // Exit early, will be handled in onload
            } else {
                mainData.image = null;
            }
            console.log('Sending image data:', typeof mainData.image);
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
                onMove={openMoveModal}
                onFound={handleFound}
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
            <CenteredModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} title={"Chyba"}>
                <div style={{ color: '#FF6262', fontWeight: 600, fontSize: 16 }}>{errorMessage}</div>
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
            <CenteredModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} title="Přesun položky" disableClickAway={isLocationPickerOpen}>
                {item && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ color: "#0074D9", fontWeight: 600 }}>
                            Položka bude přesunuta do jiné místnosti
                        </div>
                        <div style={{ borderRadius: 16, background: "#f0f1f3", overflow: "hidden", display: "flex", flexDirection: "column", width: "100%" }}>
                            {item.image && (
                                <img
                                    src={
                                        /^data:image\//.test(item.image)
                                            ? item.image
                                            : (/^[A-Za-z0-9+/=]+$/.test(item.image) && item.image.length > 100)
                                                ? `data:image/*;base64,${item.image}`
                                                : item.image
                                    }
                                    alt={item.name}
                                    style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                                />
                            )}
                            <div className="p-4 gap-4 flex flex-col">
                                <div>
                                    <CardItemName>{item.name}</CardItemName>
                                    <div style={{ fontSize: 12, color: "#535353" }}>{item.note}</div>
                                </div>
                                <div style={{ fontStyle: "italic", fontSize: 12, color: "#535353" }}>
                                    Poslední kontrola {item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
                            <LocationPicker value={item.location} label="Current location:" editMode={false} />
                            <span className="material-icons-round" style={{ fontSize: 24, color: "#000" }}>arrow_downward</span>
                            <LocationPicker 
                              value={moveNewLocation} 
                              label="New location:" 
                              editMode={true} 
                              onChange={setMoveNewLocation}
                              onModalOpen={() => setIsLocationPickerOpen(true)}
                              onModalClose={() => setIsLocationPickerOpen(false)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            <Button icon="check" iconPosition="right" onClick={handleMoveConfirm}>
                                Potvrdit změnu lokace
                            </Button>
                            <Button variant="secondary" icon="close" iconPosition="right" onClick={() => setIsMoveModalOpen(false)}>
                                Storno
                            </Button>
                        </div>
                    </div>
                )}
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