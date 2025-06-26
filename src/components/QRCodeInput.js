"use client";
import React, { useState } from "react";
import QRScannerModal from "./QRScannerModal";

export default function QRCodeInput({ value, onChange, editMode = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScan = (scannedValue) => {
    if (scannedValue) {
      onChange(scannedValue);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={editMode ? () => setIsModalOpen(true) : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: 0,
          cursor: editMode ? "pointer" : "default",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
          <div style={{ color: "#535353", fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
            QR kód:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
              qr_code
            </span>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
              {value ? (typeof value === "string" ? value : JSON.stringify(value)) : "QR kód nevybrán"}
            </span>
          </div>
        </div>
        {editMode && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
              edit
            </span>
          </div>
        )}
      </button>
      <QRScannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScan={handleScan}
      />
    </>
  );
} 