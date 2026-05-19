"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import BaseItemPicker from "@/components/molecules/BaseItemPicker";
import LinkItemDetailTemplate from "@/components/organisms/LinkItemDetailTemplate";
import CenteredModal from "@/components/molecules/CenteredModal";
import { useBaseItemDetails, useLinkBaseItemToEvent } from "@/hooks/useBaseItems";
import {
  resolveAddToInventuraState,
  resolveScreenReturnTo,
  HOME_PATH,
} from "@/utils/inventoryNavigation";

export default function LinkItemForm({
  stocktakingId,
  defaultReturnTo = HOME_PATH,
}) {
  const { fetchById, loading: detailsLoading } = useBaseItemDetails();
  const { linkToEvent, loading: linkLoading } = useLinkBaseItemToEvent();
  const baseItemsLoading = detailsLoading || linkLoading;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = useMemo(
    () => resolveScreenReturnTo(searchParams, defaultReturnTo),
    [searchParams, defaultReturnTo]
  );
  const linkInventoryState = useMemo(
    () => resolveAddToInventuraState(pathname),
    [pathname]
  );

  const [isBaseItemPickerOpen, setIsBaseItemPickerOpen] = useState(false);
  const [selectedBaseItem, setSelectedBaseItem] = useState(null);
  const [editItem, setEditItem] = useState({
    name: "",
    description: "",
    note: "",
    image: "",
    location: null,
    qr: "",
    baseItemId: null,
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState({
    title: "",
    message: "",
    success: false,
  });
  useEffect(() => {
    const handleOpenPicker = () => setIsBaseItemPickerOpen(true);
    window.addEventListener("openBaseItemPicker", handleOpenPicker);
    return () => window.removeEventListener("openBaseItemPicker", handleOpenPicker);
  }, []);

  const showActionModal = (title, message, success) => {
    setActionModalContent({ title, message, success });
    setActionModalOpen(true);
  };

  const handleBaseItemSelect = async (baseItem) => {
    setSelectedBaseItem(baseItem);

    try {
      const baseItemDetails = await fetchById(baseItem.id);
      setEditItem((prev) => ({
        ...prev,
        id: baseItemDetails.id,
        baseItemId: baseItemDetails.id,
        name: baseItemDetails.name,
        description: baseItemDetails.description,
        image: baseItemDetails.image,
        location: baseItemDetails.location,
        qr: baseItemDetails.qr || "",
      }));
    } catch {
      setEditItem((prev) => ({
        ...prev,
        id: baseItem.id,
        baseItemId: baseItem.id,
        name: baseItem.name,
        description: baseItem.description,
        image: baseItem.image,
        location: baseItem.location,
        qr: baseItem.qr || "",
      }));
    }
  };

  const handleSave = async () => {
    if (!selectedBaseItem) {
      showActionModal("Chyba", "Nejprve vyberte základní položku.", false);
      return;
    }

    if (!stocktakingId) {
      showActionModal("Chyba", "Nejprve vyberte inventuru.", false);
      return;
    }

    try {
      await linkToEvent({
        rmId: selectedBaseItem.id,
        eventId: stocktakingId,
        status: linkInventoryState,
        note: editItem.note || "",
        qr: editItem.qr || "",
        location: editItem.location || null,
      });
      showActionModal("Hotovo", "Položka byla úspěšně přidána do inventury.", true);
      router.push(returnTo);
    } catch (error) {
      showActionModal(
        "Chyba",
        `Nepodařilo se propojit položku s inventurou: ${error.message}`,
        false
      );
    }
  };

  return (
    <>
      <LinkItemDetailTemplate
        item={editItem}
        onEditItemChange={setEditItem}
        returnTo={returnTo}
      />

      <BaseItemPicker
        isOpen={isBaseItemPickerOpen}
        onClose={() => setIsBaseItemPickerOpen(false)}
        onSelectBaseItem={handleBaseItemSelect}
      />

      <CenteredModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={actionModalContent.title}
      >
        <div
          style={{
            color: actionModalContent.success ? "#2ecc40" : "#FF6262",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {actionModalContent.message}
        </div>
      </CenteredModal>

      <div
        className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)",
        }}
      >
        <div className="container flex items-center p-4">
          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
            style={{ fontSize: "0.75rem" }}
            onClick={handleSave}
            disabled={!selectedBaseItem || baseItemsLoading}
          >
            {linkLoading ? "Ukládám..." : "Propojit s inventurou"}
            <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>
              check
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
