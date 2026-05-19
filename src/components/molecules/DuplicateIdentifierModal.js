"use client";

import { useEffect, useState } from "react";
import CenteredModal from "@/components/molecules/CenteredModal";
import QRCodeInput from "@/components/molecules/QRCodeInput";
import Button from "@/components/atoms/Button";
import { useInventoryIdentifiersAvailability } from "@/hooks/useInventoryIdentifiersAvailability";
import { suggestDuplicateIdentifier } from "@/utils/duplicateIdentifier";

export default function DuplicateIdentifierModal({
  isOpen,
  onClose,
  originalCode,
  onConfirm,
  loading = false,
}) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCode(suggestDuplicateIdentifier(originalCode));
    }
  }, [isOpen, originalCode]);

  const { available, valid, checking, error } = useInventoryIdentifiersAvailability(code, {
    enabled: isOpen,
  });

  const trimmed = String(code ?? "").trim();
  const canConfirm = trimmed.length > 0 && valid && !checking && !loading;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(trimmed);
  };

  return (
    <CenteredModal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title="Inventární číslo pro kopii"
      disableClickAway={loading}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#535353", lineHeight: 1.4 }}>
          Kopie potřebuje vlastní inventurizační číslo / QR. Upravte návrh nebo naskenujte kód.
        </p>
        <QRCodeInput
          value={code}
          onChange={setCode}
          editMode
          validateAvailability
          checking={checking}
          available={available}
          checkError={error}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Zrušit
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {loading ? "Duplikuji…" : "Duplikovat"}
          </Button>
        </div>
      </div>
    </CenteredModal>
  );
}
