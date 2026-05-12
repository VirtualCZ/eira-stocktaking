"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "react-qr-barcode-scanner";

/**
 * Inline QR scanner (same behaviour as QRScannerModal, without modal chrome).
 * When `active` is false, the camera is not mounted.
 */
export default function InlineQrScanner({ active, onScan, validate, wrapperStyle }) {
    const [scannedDataString, setScannedDataString] = useState(null);
    const [displayMessage, setDisplayMessage] = useState("Skenujte QR kód...");
    const [scannerError, setScannerError] = useState(false);
    const [scannerSession, setScannerSession] = useState(0);
    const lastSubmittedRef = useRef(null);
    const openedAtRef = useRef(0);

    useEffect(() => {
        if (!active) {
            setScannedDataString(null);
            setScannerError(false);
            setDisplayMessage("Skenujte QR kód...");
            return;
        }
        setScannerSession((prev) => prev + 1);
        openedAtRef.current = Date.now();
        setDisplayMessage("Skenujte QR kód...");
        setScannedDataString(null);
        setScannerError(false);
    }, [active]);

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
            } catch (_e) {
                /* ignore */
            }
            if (result.valid) {
                setDisplayMessage(result.message || "Naskenováno!");
                lastSubmittedRef.current = scannedDataString;
                onScan(scannedDataString, result.data);
            } else {
                setDisplayMessage(result.message || "QR není platný.");
            }
        } else {
            lastSubmittedRef.current = scannedDataString;
            onScan(scannedDataString);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scannedDataString]);

    const handleScan = (err, result) => {
        if (result && result.text) {
            const candidate = String(result.text).trim();
            if (!candidate) {
                return;
            }
            const warmupMs = Date.now() - openedAtRef.current;
            if (candidate === lastSubmittedRef.current && warmupMs < 1200) {
                return;
            }
            setScannedDataString(candidate);
            setScannerError(false);
        } else if (err) {
            setScannerError(true);
            setScannedDataString(null);
        }
    };

    if (!active) {
        return null;
    }

    return (
        <div
            style={{
                background: "#fff",
                textAlign: "center",
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                flex: 1,
                minHeight: 0,
                ...(wrapperStyle || {}),
            }}
        >
            <div style={{ flexGrow: 1, position: "relative", width: "100%", overflow: "hidden" }}>
                <QrScanner
                    key={scannerSession}
                    onUpdate={handleScan}
                    onError={(error) => handleScan(error, null)}
                    constraints={{ facingMode: "environment" }}
                    style={{ width: "100%", height: "100%", minHeight: "220px" }}
                />
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
                        pointerEvents: "none",
                    }}
                />
            </div>
            <div
                style={{
                    color: "#333",
                    whiteSpace: "pre-line",
                    fontSize: "0.875rem",
                    padding: "0.75rem",
                    minHeight: "40px",
                    flexShrink: 0,
                    fontWeight: 500,
                    background: "#f8f9fa",
                }}
            >
                {displayMessage}
            </div>
        </div>
    );
}
