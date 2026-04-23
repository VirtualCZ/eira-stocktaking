"use client";
import { useState, useEffect, useCallback } from "react";
import LinkItemDetailTemplate from "@/components/organisms/LinkItemDetailTemplate";
import { useCreateStocktakingItem } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/molecules/CenteredModal";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { useRouter } from "next/navigation";
import { useEntregs } from "@/hooks/useEntregs";
import DropdownCard from "@/components/molecules/DropdownCard";
import PictureInput from "@/components/molecules/PictureInput";
import TextInput from "@/components/atoms/TextInput";
import LocationPicker from "@/components/organisms/LocationPicker";
import QRCodeInput from "@/components/molecules/QRCodeInput";
import Link from "next/link";


export default function NewItem() {
    const { selectedInventura } = useSelectedInventura();
    const router = useRouter();
    const [entregs, entregsLoading, entregsError] = useEntregs();
    const [editItem, setEditItem] = useState({
        name: "",
        description: "",
        note: "",
        image: "",
        location: null,
        qr: "",
        properties: [],
        entregId: null,
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
        // Validate required fields
        if (!editItem.entregId) {
            showActionModal("Chyba", "Musíte vybrat typ objektu.", false);
            return;
        }
        
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
            entregId: editItem.entregId,
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

    // Prepare entreg options for dropdown - ensure entregs is an array
    const entregOptions = Array.isArray(entregs) 
        ? entregs.map(entreg => ({
            value: entreg.entregId,
            text: entreg.entregDesc || entreg.entregMetaCode
        }))
        : [];

    const selectedEntreg = entregOptions.find(opt => opt.value === editItem.entregId) || null;

    // Stable handlers to prevent re-renders
    const handleNameChange = useCallback((e) => {
        setEditItem(prev => ({ ...prev, name: e.target.value }));
    }, []);

    const handleDescriptionChange = useCallback((e) => {
        setEditItem(prev => ({ ...prev, description: e.target.value }));
    }, []);

    const handleNoteChange = useCallback((e) => {
        setEditItem(prev => ({ ...prev, note: e.target.value }));
    }, []);

    const handleEntregChange = useCallback((option) => {
        setEditItem(prev => ({ ...prev, entregId: option.value }));
    }, []);

    const handleLocationChange = useCallback((loc) => {
        setEditItem(prev => ({ ...prev, location: loc }));
    }, []);

    const handleQRChange = useCallback((code) => {
        setEditItem(prev => ({ ...prev, qr: code }));
    }, []);

    const handleImageChange = useCallback((image) => {
        setEditItem(prev => ({ ...prev, image }));
    }, []);

    return (
        <>
            <div className="relative min-h-screen flex flex-col">
                <main className="flex flex-col items-center" style={{ minHeight: "100vh" }}>
                    <div className="flex flex-col container">
                        <Link
                            href="/"
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
                            <span className="material-icons-round" style={{ fontSize: 16 }}>home</span>
                        </Link>
                        <PictureInput 
                            value={editItem.image || ""} 
                            onChange={handleImageChange}
                            editMode={true} 
                        />
                        <div className="p-4 flex flex-col gap-4" style={{ paddingBottom: "6rem" }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <TextInput
                                        value={editItem.name}
                                        onChange={handleNameChange}
                                        label="Název"
                                        placeholder="Název"
                                    />
                                </div>
                                <TextInput
                                    value={editItem.description}
                                    onChange={handleDescriptionChange}
                                    label="Popisek"
                                    placeholder="Popisek"
                                />
                            </div>
                            <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                            <TextInput
                                value={editItem.note || ""}
                                onChange={handleNoteChange}
                                label="Poznámka k inventuře"
                                placeholder="Poznámka k inventuře"
                                multiline
                            />
                            <DropdownCard
                                label="Typ objektu"
                                options={entregOptions}
                                selected={selectedEntreg}
                                onSelect={handleEntregChange}
                                disabled={entregsLoading}
                            />
                            {entregsError && (
                                <div style={{ color: '#FF6262', fontSize: '12px', marginTop: '4px' }}>
                                    Chyba při načítání typů objektů: {entregsError.message}
                                </div>
                            )}
                            {entregsLoading && (
                                <div style={{ color: '#535353', fontSize: '12px', marginTop: '4px' }}>
                                    Načítání typů objektů...
                                </div>
                            )}
                            <LocationPicker
                                value={editItem.location}
                                onChange={handleLocationChange}
                                editMode={true}
                            />
                            <QRCodeInput
                                value={editItem.qr}
                                onChange={handleQRChange}
                                editMode={true}
                            />
                        </div>
                    </div>
                </main>
            </div>
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