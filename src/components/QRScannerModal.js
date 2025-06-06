"use client";
import { useState, useEffect } from "react";
import QrScanner from "react-qr-barcode-scanner";
import Modal from "./Modal";

export default function QRScannerModal({ isOpen, onClose, onScan, validate }) {
    const [scannedDataString, setScannedDataString] = useState(null);
    const [displayMessage, setDisplayMessage] = useState("Skenujte QR kód...");
    const [showModal, setShowModal] = useState(false);
    const [scannerError, setScannerError] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowModal(false);
            return;
        }
        setShowModal(true);
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
            } catch (e) {}
            if (result.valid) {
                setDisplayMessage(result.message || "Naskenováno!");
                onScan(scannedDataString, result.data);
                onClose();
            } else {
                setDisplayMessage(result.message || "QR není platný.");
            }
        } else {
            // No validation: just send the scanned string and close
            onScan(scannedDataString);
            onClose();
        }
    // Only run when scannedDataString changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scannedDataString]);

    const handleScan = (err, result) => {
        if (result && result.text) {
            setScannedDataString(result.text);
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
        <Modal
            contentStyle={{
                padding: 0
            }}
            height="70vh"
            isOpen={showModal}>
                <div style={{
                    background: "#282828",
                    padding: "20px",
                    paddingTop: "50px",
                    textAlign: "center",
                    position: "relative",
                    width: "100%",
                    boxShadow: "0px -5px 15px rgba(0,0,0,0.2)",
                    transform: showModal ? "translateY(0%)" : "translateY(100%)",
                    transition: "transform 0.3s ease-in-out",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            zIndex: 1000
                        }}
                    >
                        <span className="material-icons-round" style={{ fontSize: "18px" }}>
                            close
                        </span>
                    </button>

                    <div style={{ flexGrow: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                        {isOpen && (
                            <QrScanner
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
                                border: "3px solid rgba(255,255,255,0.7)",
                                borderRadius: "12px",
                                boxSizing: "border-box",
                                pointerEvents: "none"
                            }}
                        />
                    </div>

                    <div style={{
                        color: "#fff",
                        whiteSpace: "pre-line",
                        fontSize: 16,
                        padding: "10px 0",
                        minHeight: '40px',
                        flexShrink: 0
                    }}>
                        {displayMessage}
                    </div>
                </div>
        </Modal>
    );
}