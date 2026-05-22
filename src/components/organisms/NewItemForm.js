"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useCreateInventoryObject } from "@/hooks/useStocktakingItems";
import CenteredModal from "@/components/molecules/CenteredModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEntregs } from "@/hooks/useEntregs";
import DropdownCard from "@/components/molecules/DropdownCard";
import PictureInput from "@/components/molecules/PictureInput";
import TextInput from "@/components/atoms/TextInput";
import LocationPicker from "@/components/organisms/LocationPicker";
import QRCodeInput from "@/components/molecules/QRCodeInput";
import { useGetLocation } from "@/hooks/useLocation";
import {
  resolveScreenReturnTo,
  resolveAddToInventuraState,
  buildStocktakingItemUrl,
  HOME_PATH,
} from "@/utils/inventoryNavigation";
import {
  useInventoryIdentifiersAvailability,
  useInventoryIdentifiersCheck,
  getIdentifierValidationError,
} from "@/hooks/useInventoryIdentifiersAvailability";
import NavBackLink from "@/components/molecules/NavBackLink";
import ItemAttachmentsSection from "@/components/molecules/ItemAttachmentsSection";

/**
 * @param {object} props
 * @param {number} props.stocktakingId - inventura event id for API create
 * @param {string} props.defaultReturnTo - back/save target when returnTo query is absent
 */
export default function NewItemForm({
  stocktakingId,
  defaultReturnTo = HOME_PATH,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createInventoryState = useMemo(
    () => resolveAddToInventuraState(pathname),
    [pathname]
  );
  const getLocation = useGetLocation();
  const returnTo = useMemo(
    () => resolveScreenReturnTo(searchParams, defaultReturnTo),
    [searchParams, defaultReturnTo]
  );

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
  const [prefillDone, setPrefillDone] = useState(false);

  const codeTrimmed = String(editItem.qr ?? "").trim();

  const {
    valid: identifiersValid,
    available: identifierAvailable,
    checking: identifiersChecking,
    error: identifiersCheckError,
  } = useInventoryIdentifiersAvailability(codeTrimmed, {
    enabled: Boolean(codeTrimmed),
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState({
    title: "",
    message: "",
    success: false,
  });

  const attachmentsRef = useRef(null);
  const { createItem, loading, error } = useCreateInventoryObject(stocktakingId || null);
  const { checkAvailability } = useInventoryIdentifiersCheck();

  useEffect(() => {
    if (prefillDone) return;
    const qrParam = searchParams.get("qr");
    const userLoc = getLocation();
    setEditItem((prev) => ({
      ...prev,
      ...(qrParam ? { qr: qrParam } : {}),
      ...(userLoc ? { location: userLoc } : {}),
    }));
    setPrefillDone(true);
  }, [searchParams, getLocation, prefillDone]);

  const showActionModal = (title, message, success) => {
    setActionModalContent({ title, message, success });
    setActionModalOpen(true);
  };

  function propertiesArrayToObject(propertiesArr) {
    const obj = {};
    for (const prop of propertiesArr || []) {
      if ((prop.key || prop.name) && (prop.key || prop.name).trim() !== "") {
        obj[prop.key || prop.name] = prop.value;
      }
    }
    return obj;
  }

  function mapLocationToApi(location) {
    if (!location) return undefined;
    return {
      building: location.building ?? 0,
      storey: location.storey ?? 0,
      room: location.room ?? 0,
    };
  }

  const handleCreateResult = useCallback(
    async (payload) => {
      const result = await createItem(payload);
      if (!result?.id) {
        showActionModal("Chyba", error?.message || "Nepodařilo se vytvořit položku.", false);
        return;
      }
      try {
        await attachmentsRef.current?.commitPending?.(result.id);
      } catch (err) {
        showActionModal(
          "Chyba",
          err?.message || "Přílohy se nepodařilo uložit.",
          false
        );
        return;
      }
      router.push(
        buildStocktakingItemUrl(stocktakingId, result.id, { returnTo })
      );
    },
    [createItem, error, router, stocktakingId, returnTo]
  );

  const handleSave = async () => {
    if (!stocktakingId) {
      showActionModal("Chyba", "Nejprve vyberte inventuru.", false);
      return;
    }
    if (!editItem.entregId) {
      showActionModal("Chyba", "Musíte vybrat typ objektu.", false);
      return;
    }
    if (!codeTrimmed) {
      showActionModal("Chyba", "Inventurizační číslo / QR je povinné.", false);
      return;
    }

    if (codeTrimmed) {
      try {
        const result = await checkAvailability(codeTrimmed);
        const validationError = getIdentifierValidationError({
          code: codeTrimmed,
          result,
        });
        if (validationError) {
          showActionModal("Chyba", validationError, false);
          return;
        }
      } catch {
        showActionModal("Chyba", "Nepodařilo se ověřit inventurizační číslo / QR.", false);
        return;
      }
    }

    if (!identifiersValid) {
      showActionModal(
        "Chyba",
        identifiersCheckError
          ? "Nepodařilo se ověřit inventurizační číslo / QR."
          : "Inventurizační číslo / QR není platné nebo je již obsazené.",
        false
      );
      return;
    }

    const propertiesArr = Array.isArray(editItem.properties)
      ? editItem.properties
      : Object.entries(editItem.properties || {}).map(([key, value]) => ({ key, value }));
    if (propertiesArr.some((p) => !(p.key || p.name) || (p.key || p.name).trim() === "")) {
      showActionModal("Chyba", "Všechny pole 'Vlastnost' musí být vyplněné.", false);
      return;
    }

    const newItemPayload = {
      name: editItem.name,
      description: editItem.description,
      note: editItem.note,
      location: mapLocationToApi(editItem.location),
      invNumber: codeTrimmed,
      qr: codeTrimmed,
      properties: propertiesArrayToObject(propertiesArr),
      entregId: editItem.entregId,
      state: createInventoryState,
    };

    const currentImage = editItem.image || null;
    if (currentImage instanceof File) {
      const reader = new FileReader();
      reader.onload = async () => {
        newItemPayload.image = reader.result;
        await handleCreateResult(newItemPayload);
      };
      reader.readAsDataURL(currentImage);
      return;
    }

    newItemPayload.image =
      currentImage && typeof currentImage === "string" ? currentImage : null;
    await handleCreateResult(newItemPayload);
  };

  const entregOptions = Array.isArray(entregs)
    ? entregs.map((entreg) => ({
        value: entreg.entregId,
        text: entreg.entregDesc || entreg.entregMetaCode,
      }))
    : [];

  const selectedEntreg = entregOptions.find((opt) => opt.value === editItem.entregId) || null;

  return (
    <>
      <div className="relative min-h-screen flex flex-col">
        <main className="flex flex-col items-center" style={{ minHeight: "100vh" }}>
          <div className="flex flex-col container">
            <NavBackLink returnTo={returnTo} />
            <PictureInput
              value={editItem.image || ""}
              onChange={(image) => setEditItem((prev) => ({ ...prev, image }))}
              editMode
            />
            <div className="p-4 flex flex-col gap-4" style={{ paddingBottom: "6rem" }}>
              <div>
                <TextInput
                  value={editItem.name}
                  onChange={(e) => setEditItem((prev) => ({ ...prev, name: e.target.value }))}
                  label="Název"
                  placeholder="Název"
                />
                <TextInput
                  value={editItem.description}
                  onChange={(e) =>
                    setEditItem((prev) => ({ ...prev, description: e.target.value }))
                  }
                  label="Popisek"
                  placeholder="Popisek"
                />
              </div>
              <div style={{ width: "100%", height: 2, background: "#F0F1F3" }} />
              <TextInput
                value={editItem.note || ""}
                onChange={(e) => setEditItem((prev) => ({ ...prev, note: e.target.value }))}
                label="Poznámka k inventuře"
                placeholder="Poznámka k inventuře"
                multiline
              />
              <DropdownCard
                label="Typ objektu"
                options={entregOptions}
                selected={selectedEntreg}
                onSelect={(option) =>
                  setEditItem((prev) => ({ ...prev, entregId: option.value }))
                }
                disabled={entregsLoading}
              />
              {entregsError && (
                <div style={{ color: "#FF6262", fontSize: "12px", marginTop: "4px" }}>
                  Chyba při načítání typů objektů: {entregsError.message}
                </div>
              )}
              {entregsLoading && (
                <div style={{ color: "#535353", fontSize: "12px", marginTop: "4px" }}>
                  Načítání typů objektů...
                </div>
              )}
              <LocationPicker
                value={editItem.location}
                onChange={(loc) => setEditItem((prev) => ({ ...prev, location: loc }))}
                editMode
              />
              <QRCodeInput
                value={editItem.qr}
                onChange={(code) => setEditItem((prev) => ({ ...prev, qr: code }))}
                editMode
                validateAvailability
                checking={identifiersChecking}
                available={identifierAvailable}
                checkError={identifiersCheckError}
              />
              <ItemAttachmentsSection ref={attachmentsRef} editMode />
            </div>
          </div>
        </main>
      </div>
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
      <CenteredModal isOpen={loading} title="Probíhá akce...">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span>Probíhá akce...</span>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
        </div>
      </CenteredModal>
      <div
        className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)",
        }}
      >
        <div className="container flex items-center gap-2 p-4 justify-center">
          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
            style={{ fontSize: "0.75rem" }}
            onClick={handleSave}
          >
            Vytvořit objekt
            <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>
              check
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
