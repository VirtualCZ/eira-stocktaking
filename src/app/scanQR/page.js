"use client";
import { useState } from "react";
import QrScanner from "react-qr-barcode-scanner";

export default function ScanPage() {
  const [data, setData] = useState("No result");

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <QrScanner
        onUpdate={(err, result) => {
          if (result) setData(result.text);
        }}
        style={{ width: "100vw", height: "100vh" }}
      // constraints={{ facingMode: "environment" }}
      />
      {/* Overlay for QR guide */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "60vw",
          height: "60vw",
          maxWidth: "320px",
          maxHeight: "320px",
          transform: "translate(-50%, -50%)",
          border: "4px solid #fff",
          borderRadius: "16px",
          boxSizing: "border-box",
          pointerEvents: "none"
        }}
      />
      {/* Show scanned data (for debug) */}
      <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, color: "#fff", textAlign: "center" }}>{data}</div>
    </div>
  );
}