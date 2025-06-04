"use client";
import PageHeading from "@/components/PageHeading";
import { useState } from "react";
import QrScanner from "react-qr-barcode-scanner";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import { useSetLocation } from "@/hooks/useLocation";
import Button from "@/components/Button";

export default function ScanPage() {
  const [showModal, setShowModal] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const router = useRouter();
  const setLocation = useSetLocation();

  const handleScan = (err, result) => {
    if (result) {
      let parsed;
      try {
        parsed = JSON.parse(result.text);
      } catch {
        return;
      }
      if (parsed.type === "item" && parsed.data && parsed.data.id) {
        router.push(`/stocktakingDetail/${parsed.data.id}`);
      } else if (parsed.type === "location" && parsed.data) {
        setLocationData(parsed.data);
        setShowModal(true);
      }
    }
  };

  const handleConfirmLocation = () => {
    if (locationData) {
      setLocation(locationData);
    }
    setShowModal(false);
    setLocationData(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setLocationData(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center" style={{ background: "#F2F3F5" }}>
      <main className="container" style={{ minHeight: "100vh", background: "#F2F3F5", display: "flex", padding: "1rem", flexDirection: "column", gap: "1rem" }}>
        <PageHeading heading="Sken QR" route="/" />
        <div style={{ display: "flex", borderRadius: "1rem", overflow: "hidden", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", position: "relative" }}>
          <QrScanner
            onUpdate={handleScan}
            onError={(error) => handleScan(error, null)}
            constraints={{ facingMode: "environment" }}
            style={{ width: "100%", height: "100%" }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "60%",
              aspectRatio: "1 / 1",
              transform: "translate(-50%, -50%)",
              border: "4px solid #fff",
              borderRadius: "16px",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          />
        </div>
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title="Změnit lokaci?"
          height="fit-content"
          contentStyle={{
            gap: "1rem",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div>Chcete změnit svoji lokaci na:
            {locationData && (
              <div>
                Budova: {locationData.budova || "-"}<br />
                Podlaží: {locationData.podlazi || "-"}<br />
                Místnost: {locationData.mistnost || "-"}
              </div>
            )}
          </div>
          <Button
            onClick={handleConfirmLocation}
          >
            Ano
          </Button>
          <Button
            onClick={handleCloseModal}
          >
            Ne
          </Button>
        </Modal>
      </main>
    </div>
  );
}
