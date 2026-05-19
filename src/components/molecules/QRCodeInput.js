"use client";

import { useState } from "react";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import TextInput from "@/components/atoms/TextInput";

/** Inventurizační číslo / QR — type manually or scan (same value for both DB columns). */
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            width: "100%",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextInput
              label="Inventurizační číslo / QR"
              placeholder="Zadejte číslo"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Naskenovat kód"
            aria-label="Naskenovat kód"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              marginBottom: 2,
              borderRadius: 12,
              background: "#f0f1f3",
              border: "1px solid #e0e0e0",
              cursor: "pointer",
              color: "#000",
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 22 }}>
              qr_code_scanner
            </span>
          </button>
        </div>
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
