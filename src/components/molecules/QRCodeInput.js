"use client";

import { useState } from "react";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import TextInput from "@/components/atoms/TextInput";

/** Single field for inventurizační číslo (= QR on create). */
export default function QRCodeInput({
  value,
  onChange,
  editMode = true,
  validateAvailability = false,
  checking = false,
  available = null,
  checkError = null,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScan = (scannedValue) => {
    if (scannedValue) {
      onChange(typeof scannedValue === "string" ? scannedValue.trim() : String(scannedValue));
      setIsModalOpen(false);
    }
  };

  const trimmed = String(value ?? "").trim();
  const showConflict = validateAvailability && trimmed && available === false;
  const showOk = validateAvailability && trimmed && available === true && !checking;

  if (!editMode) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ color: "#535353", fontWeight: 500, fontSize: 14 }}>
          Inventurizační číslo / QR:
        </div>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
          {trimmed || "—"}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <TextInput
          label="Inventurizační číslo / QR"
          placeholder="Zadejte nebo naskenujte kód"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 16,
            background: "#f0f1f3",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
            color: "#000",
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 18 }}>
            qr_code_scanner
          </span>
          Naskenovat kód
        </button>
        {validateAvailability && trimmed && checking && (
          <div style={{ fontSize: 12, color: "#535353" }}>Kontroluji číslo…</div>
        )}
        {showConflict && (
          <div style={{ fontSize: 12, color: "#FF6262", fontWeight: 600 }}>
            Toto inventurizační číslo / QR je již použito.
          </div>
        )}
        {showOk && (
          <div style={{ fontSize: 12, color: "#2ecc40", fontWeight: 600 }}>
            Inventurizační číslo / QR je volné.
          </div>
        )}
        {checkError && (
          <div style={{ fontSize: 12, color: "#FF6262" }}>
            Nepodařilo se ověřit inventurizační číslo / QR.
          </div>
        )}
      </div>
      <QRScannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScan={handleScan}
        validate={false}
      />
    </>
  );
}
