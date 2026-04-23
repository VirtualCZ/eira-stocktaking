import { useState, useEffect, useRef } from "react";
import QrScanner from "react-qr-barcode-scanner";
import CenteredModal from "@/components/molecules/CenteredModal";

export default function QRScannerModal({ isOpen, onClose, onScan, validate }) {
    const [scannedDataString, setScannedDataString] = useState(null);
    const [displayMessage, setDisplayMessage] = useState("Skenujte QR kód...");
    const [showModal, setShowModal] = useState(false);
    const [scannerError, setScannerError] = useState(false);
    const [scannerSession, setScannerSession] = useState(0);
    const lastSubmittedRef = useRef(null);
    const openedAtRef = useRef(0);

    useEffect(() => {
        if (!isOpen) {
            setShowModal(false);
            setScannedDataString(null);
            setScannerError(false);
            setDisplayMessage("Skenujte QR kód...");
            return;
        }
        setShowModal(true);
        setScannerSession((prev) => prev + 1);
        openedAtRef.current = Date.now();
        setDisplayMessage("Skenujte QR kód...");
        setScannedDataString(null);
        setScannerError(false);
    }, [isOpen]);

    useEffect(() => {
        if (!scannedDataString) {
            if (!scannerError) setDisplayMessage("Skenujte QR kód...");
            return;
        }
        setScannerError(false);
        if (validate) {
            let result = { valid: false, message: "QR není ve správném formátu JSON." };
            try {
                const parsed = JSON.parse(scannedDataString);
                result = validate(parsed);
            } catch (e) { }
            if (result.valid) {
                setDisplayMessage(result.message || "Naskenováno!");
                lastSubmittedRef.current = scannedDataString;
                onScan(scannedDataString, result.data);
                onClose();
            } else {
                setDisplayMessage(result.message || "QR není platný.");
            }
        } else {
            // No validation: just send the scanned string and close
            lastSubmittedRef.current = scannedDataString;
            onScan(scannedDataString);
            onClose();
        }
        // Only run when scannedDataString changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scannedDataString]);

    const handleScan = (err, result) => {
        if (result && result.text) {
            const candidate = String(result.text).trim();
            if (!candidate) {
                return;
            }
            // Some camera stacks can emit the previous frame/code immediately after reopening.
            // Ignore same-as-last value only during short warmup window.
            const warmupMs = Date.now() - openedAtRef.current;
            if (candidate === lastSubmittedRef.current && warmupMs < 1200) {
                return;
            }
            setScannedDataString(candidate);
            setScannerError(false);
        } else if (err) {
            //   console.error("QR Scan Error:", err);
            //   setDisplayMessage("Chyba skeneru. Zkontrolujte oprávnění kamery.");
            setScannerError(true);
            setScannedDataString(null);
        }
    };

    if (!isOpen && !showModal) return null;

    return (
        <CenteredModal
            isOpen={showModal}
            onClose={onClose}
            title="QR Sken"
            width="90vw"
        >
            <div style={{
                background: "#fff",
                padding: "1rem",
                textAlign: "center",
                position: "relative",
                width: "100%",
                height: "60vh",
                maxHeight: "500px",
                display: "flex",
                flexDirection: "column",
                borderRadius: "8px",
            }}>

                <div style={{ flexGrow: 1, position: 'relative', width: '100%', overflow: 'hidden', borderRadius: "16px" }}>
                    {isOpen && (
                        <QrScanner
                            key={scannerSession}
                            onUpdate={handleScan}
                            onError={(error) => handleScan(error, null)}
                            constraints={{ facingMode: "environment" }}
                            style={{ width: "100%", height: "100%" }}
                        />
                    )}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "min(60vw, 200px)",
                            height: "min(60vw, 200px)",
                            transform: "translate(-50%, -50%)",
                            border: "3px solid rgba(0, 0, 0, 0.7)",
                            borderRadius: "12px",
                            boxSizing: "border-box",
                            pointerEvents: "none"
                        }}
                    />
                </div>

                <div style={{
                    color: "#333",
                    whiteSpace: "pre-line",
                    fontSize: "0.875rem",
                    padding: "0.75rem 0",
                    minHeight: '40px',
                    flexShrink: 0,
                    fontWeight: 500
                }}>
                    {displayMessage}
                </div>
            </div>
        </CenteredModal>
    );
}