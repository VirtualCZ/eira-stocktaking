"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import QrScanner from "react-qr-barcode-scanner";
import Button from "@/components/Button";

export default function ScanPage() {
  const [data, setData] = useState(null);
  const [formatted, setFormatted] = useState("");
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const router = useRouter();

  // Format location data for UX
  useEffect(() => {
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "location" && parsed.data) {
        const { budova, podlazi, mistnost } = parsed.data;
        setFormatted(
          `Budova: ${budova || "-"}\nPodlaží: ${podlazi || "-"}\nMístnost: ${mistnost || "-"}`
        );
      } else {
        setFormatted("QR neobsahuje platnou lokaci.");
      }
    } catch {
      setFormatted("QR není ve správném formátu.");
    }
  }, [data]);


  // Store in localStorage
  useEffect(() => {
    if (data) {
      localStorage.setItem("scannedLocation", data);
    }
  }, [data]);

  const handleReturnWithData = () => {
    if (!data || !returnTo) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "location" && parsed.data) {
        const params = new URLSearchParams(parsed.data).toString();
        router.push(`${returnTo}?${params}`);
        return;
      }
    } catch { }
    // fallback: just go back
    router.push(returnTo);
  };

  const handleReturnWithoutData = () => {
    if (returnTo) router.push(returnTo);
    else router.back();
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative" }}>
      {/* Debug: returnTo param */}
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, color: "#fff", textAlign: "center", fontSize: 12, opacity: 0.7, zIndex: 10 }}>
        returnTo: {returnTo || "(none)"}
      </div>
      <QrScanner
        onUpdate={(err, result) => {
          if (result) {
            const value = result.text;
            setData(value); // DON'T JSON.stringify here
          }
        }}
        style={{ width: "100vw", height: "100vh" }}
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
      {/* Show formatted scanned data */}
      <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, color: "#fff", textAlign: "center", whiteSpace: "pre-line", fontSize: 18 }}>
        {formatted || "Scan a QR code..."}
      </div>
      {/* Action buttons */}
      <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        <Button
          icon="check"
          onClick={handleReturnWithData}
          disabled={!data || !returnTo}
        >
          Potvrdit lokaci
        </Button>
        <Button
          icon="close"
          onClick={handleReturnWithoutData}
          disabled={!returnTo}
        >
          Zpět bez změny
        </Button>
      </div>
    </div>
  );
}