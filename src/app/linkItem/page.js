"use client";
import React, { useState, useEffect } from "react";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import BaseItemPicker from "@/components/molecules/BaseItemPicker";
import LinkItemDetailTemplate from "@/components/organisms/LinkItemDetailTemplate";
import CenteredModal from "@/components/molecules/CenteredModal";
import { useBaseItems } from "@/hooks/useBaseItems";
import { useRouter } from "next/navigation";

export default function LinkItem() {
    const { selectedInventura } = useSelectedInventura();
    const [, , baseItemsLoading, , , fetchBaseItemDetailsById, linkBaseItemToEvent] = useBaseItems({ skip: true });
    const apiLoading = baseItemsLoading;
    const router = useRouter();
    const [isBaseItemPickerOpen, setIsBaseItemPickerOpen] = useState(false);
    const [selectedBaseItem, setSelectedBaseItem] = useState(null);
    
    // Listen for custom event to open base item picker
    useEffect(() => {
        const handleOpenPicker = () => setIsBaseItemPickerOpen(true);
        window.addEventListener('openBaseItemPicker', handleOpenPicker);
        return () => window.removeEventListener('openBaseItemPicker', handleOpenPicker);
    }, []);
    const [editItem, setEditItem] = useState({
        name: "",
        description: "",
        note: "",
        image: "",
        location: null,
        qr: "",
        baseItemId: null
    });

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalContent, setActionModalContent] = useState({ title: '', message: '', success: false });
    const [isSaving, setIsSaving] = useState(false);

    // Helper to show modal
    const showActionModal = (title, message, success) => {
        setActionModalContent({ title, message, success });
        setActionModalOpen(true);
    };

    // Handler for when a base item is selected
    const handleBaseItemSelect = async (baseItem) => {
        setSelectedBaseItem(baseItem);
        
        try {
            // Fetch full base item details including image
            const baseItemDetails = await fetchBaseItemDetailsById(baseItem.id);

            // Pre-fill form with complete base item data
            setEditItem(prev => ({
                ...prev,
                id: baseItemDetails.id,
                baseItemId: baseItemDetails.id,
                name: baseItemDetails.name,
                description: baseItemDetails.description,
                image: baseItemDetails.image,
                location: baseItemDetails.location,
                qr: baseItemDetails.qr || ""
            }));
        } catch (error) {
            console.error('Error fetching base item details:', error);
            // Fallback to basic data from modal selection
            setEditItem(prev => ({
                ...prev,
                id: baseItem.id,
                baseItemId: baseItem.id,
                name: baseItem.name,
                description: baseItem.description,
                image: baseItem.image,
                location: baseItem.location,
                qr: baseItem.qr || ""
            }));
        }
    };

    // Save handler - creates inventory item via API
    const handleSave = async () => {
        if (!selectedBaseItem) {
            showActionModal("Chyba", "Nejprve vyberte základní položku.", false);
            return;
        }

        if (!selectedInventura?.id) {
            showActionModal("Chyba", "Nejprve vyberte inventuru.", false);
            return;
        }

        setIsSaving(true);
        try {
            // Create inventory item data
            const inventoryItem = {
                rmId: selectedBaseItem.id,
                eventId: selectedInventura.id,
                status: "nezkontrolováno",
                note: editItem.note || "",
                qr: editItem.qr || "",
                location: editItem.location || null
            };

            const result = await linkBaseItemToEvent(inventoryItem);
            showActionModal('Hotovo', 'Položka byla úspěšně přidána do inventury.', true);
            
            // Navigate to the newly created inventory item page
            if (result && result.id) {
                router.push(`/stocktakingList/${selectedInventura.id}/${result.id}`);
            }
        } catch (error) {
            console.error('Error creating inventory item:', error);
            showActionModal('Chyba', `Nepodařilo se vytvořit inventurní položku: ${error.message}`, false);
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedInventura) {
        return (
            <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ color: '#FF6262', fontWeight: 600, fontSize: "1.2rem" }}>
                    Nejprve vyberte inventuru na hlavní stránce.
                </div>
            </div>
        );
    }

                 return (
          <>
              {/* Stocktaking Item Form - Limited editing */}
             <LinkItemDetailTemplate
                 item={editItem}
                 onEditItemChange={setEditItem}
                 returnTo="/"
             />

            {/* Base Item Selection Modal */}
            <BaseItemPicker
                isOpen={isBaseItemPickerOpen}
                onClose={() => setIsBaseItemPickerOpen(false)}
                onSelectBaseItem={handleBaseItemSelect}
            />

            {/* Action Result Modal */}
            <CenteredModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={actionModalContent.title}>
                <div style={{ color: actionModalContent.success ? '#2ecc40' : '#FF6262', fontWeight: 600, fontSize: 16 }}>
                    {actionModalContent.message}
                </div>
            </CenteredModal>

                         {/* Fixed bottom bar with only save button */}
             <div
                 className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
                 style={{
                     background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)',
                 }}
             >
                 <div className="container flex items-center p-4">
                     <button
                         className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
                         style={{ fontSize: "0.75rem" }}
                         onClick={handleSave}
                         disabled={!selectedBaseItem || isSaving || apiLoading}
                     >
                         {isSaving || apiLoading ? "Ukládám..." : "Propojit s inventurou"}
                         <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>check</span>
                     </button>
                 </div>
             </div>
        </>
    );
}
