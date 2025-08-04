"use client";
import { useState, useEffect } from "react";
import StocktakingItemDetailTemplate from "@/components/organisms/StocktakingItemDetailTemplate";
import { useCreateStocktakingItem } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/molecules/CenteredModal";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { useRouter } from "next/navigation";


export default function NewItem() {
    const { selectedInventura } = useSelectedInventura();
    const router = useRouter();
    const [editItem, setEditItem] = useState({
        name: "",
        description: "",
        note: "",
        image: "",
        location: null,
        qr: "",
        properties: [],
    });
    const [editMode, setEditMode] = useState(true);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: '', message: '', success: false });
    const { createItem, loading, error, success } = useCreateStocktakingItem(selectedInventura?.id || null);

    // Helper to show modal
    const showActionModal = (title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    };

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
        // Validate required fields if needed
        let propertiesArr = Array.isArray(editItem.properties)
            ? editItem.properties
            : Object.entries(editItem.properties || {}).map(([key, value]) => ({ key, value }));
        if (propertiesArr.some(p => !(p.key || p.name) || (p.key || p.name).trim() === "")) {
            showActionModal("Chyba", "Všechny pole 'Vlastnost' musí být vyplněné.", false);
            return;
        }
        
        const newItem = {
            name: editItem.name,
            description: editItem.description,
            note: editItem.note,
            location: mapLocationToApi(editItem.location),
            qr: editItem.qr,
            properties: propertiesArrayToObject(propertiesArr),
        };

        // Handle image data conversion
        const currentImage = editItem.image || null;
        if (currentImage) {
            if (typeof currentImage === 'string') {
                // If it's already a base64 string, use it directly
                if (currentImage.startsWith('data:image/')) {
                    newItem.image = currentImage;
                } else {
                    newItem.image = currentImage;
                }
            } else if (currentImage instanceof File) {
                // Convert File to base64
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64Data = reader.result;
                    newItem.image = base64Data;
                    console.log('Sending image as base64 data');
                    
                    // Send the create request with base64 image data
                    const result = await createItem(newItem);
                    if (result && !error) {
                        // Navigate to the newly created item
                        if (result.id) {
                            if (selectedInventura?.id) {
                                // If we have a stocktaking event, go to stocktaking item detail
                                router.push(`/stocktakingList/${selectedInventura.id}/${result.id}`);
                            } else {
                                // Otherwise go to general item detail
                                router.push(`/itemList/${result.id}`);
                            }
                        } else {
                            showActionModal('Hotovo', 'Položka byla úspěšně vytvořena.', true);
                            setEditMode(false);
                        }
                    } else {
                        showActionModal('Chyba', error?.message || 'Nepodařilo se vytvořit položku.', false);
                    }
                };
                reader.readAsDataURL(currentImage);
                return; // Exit early, will be handled in onload
            } else {
                newItem.image = null;
            }
        } else {
            newItem.image = null;
        }

        const result = await createItem(newItem);
        if (result && !error) {
            // Navigate to the newly created item
            if (result.id) {
                if (selectedInventura?.id) {
                    // If we have a stocktaking event, go to stocktaking item detail
                    router.push(`/stocktakingList/${selectedInventura.id}/${result.id}`);
                } else {
                    // Otherwise go to general item detail
                    router.push(`/itemList/${result.id}`);
                }
            } else {
                showActionModal('Hotovo', 'Položka byla úspěšně vytvořena.', true);
                setEditMode(false);
            }
        } else {
            showActionModal('Chyba', error?.message || 'Nepodařilo se vytvořit položku.', false);
        }
    };

    return (
        <>
            <StocktakingItemDetailTemplate
                item={editItem}
                editItem={editItem}
                editMode={editMode}
                onEditItemChange={setEditItem}
                onEditModeChange={() => setEditMode(!editMode)}
                onDelete={null}
                onDuplicate={null}
                onSave={handleSave}
                showMove={false}
                showFound={false}
                loading={loading}
                error={error}
                returnTo={"/"}
                isDeleteModalOpen={false}
                setIsDeleteModalOpen={() => {}}
                bottomPadding={0}
                setBottomPadding={() => {}}
                barRendered={false}
                setBarRendered={() => {}}
            />
            {/* Action result modal for create */}
            <CenteredModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={actionModalContent.title}>
                <div style={{ color: actionModalContent.success ? '#2ecc40' : '#FF6262', fontWeight: 600, fontSize: 16 }}>{actionModalContent.message}</div>
            </CenteredModal>
            {/* Loading modal for create */}
            <CenteredModal isOpen={loading} title="Probíhá akce...">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <span>Probíhá akce...</span>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
            </CenteredModal>
            {/* Fixed bottom bar with save button */}
            <div
                className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)',
                }}
            >
                <div className="container flex items-center gap-2 p-4 justify-center">
                    <button
                        className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
                        style={{ fontSize: "0.75rem" }}
                        onClick={handleSave}
                    >
                        Vytvořit objekt
                        <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>check</span>
                    </button>
                </div>
            </div>
        </>
    );
}