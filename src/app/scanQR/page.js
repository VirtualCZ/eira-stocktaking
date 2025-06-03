"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QrScanner from "react-qr-barcode-scanner";
import Button from "@/components/Button";

function InnerScanPage() {
  const [data, setData] = useState(null);
  const [formatted, setFormatted] = useState("");
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const router = useRouter();

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
    } catch {}
    router.push(returnTo);
  };

  const handleReturnWithoutData = () => {
    if (returnTo) router.push(returnTo);
    else router.back();
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 0,
          right: 0,
          color: "#fff",
          textAlign: "center",
          fontSize: 12,
          opacity: 0.7,
          zIndex: 10,
        }}
      >
        returnTo: {returnTo || "(none)"}
      </div>
      <QrScanner
        onUpdate={(err, result) => {
          if (result) {
            setData(result.text);
          }
        }}
        style={{ width: "100vw", height: "100vh" }}
      />
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
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          color: "#fff",
          textAlign: "center",
          whiteSpace: "pre-line",
          fontSize: 18,
        }}
      >
        {formatted || "Scan a QR code..."}
      </div>
    </div>
  );
}

// This is the actual default export for the page
export default function ScanPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#fff" }}>Načítání…</div>}>
      <InnerScanPage />
    </Suspense>
  );
}
