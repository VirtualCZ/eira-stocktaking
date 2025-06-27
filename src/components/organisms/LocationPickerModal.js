"use client"
import React, { useState, useEffect, useRef } from "react";
import { useBuildings, useStories, useRooms } from "../../hooks/useBuildings";
import QRScannerModal from "../QRScannerModal";
import DropdownCard from "../DropdownCard";
import CenteredModal from "../CenteredModal";

export default function LocationPickerModal({ isOpen, onClose, onSave, initialLocation }) {
    const [buildings] = useBuildings();
    const [selectedBudova, setSelectedBudova] = useState(null);
    const [selectedPodlazi, setSelectedPodlazi] = useState(null);
    const [selectedMistnost, setSelectedMistnost] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const prevIsOpen = useRef(isOpen);

    const [stories] = useStories(selectedBudova);
    const [rooms] = useRooms(selectedBudova, selectedPodlazi);

    useEffect(() => {
        if (isOpen && !prevIsOpen.current) {
            if (initialLocation) {
                const { budova, podlazi, mistnost } = initialLocation;
                setSelectedBudova(budova ?? null);
                setSelectedPodlazi(podlazi ?? null);
                setSelectedMistnost(mistnost ? { id: mistnost } : null);
            } else {
                setSelectedBudova(null);
                setSelectedPodlazi(null);
                setSelectedMistnost(null);
            }
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, initialLocation]);

    const handleQRScan = (scannedValue) => {
        if (scannedValue) {
            try {
                let parsedScanData;
                if (typeof scannedValue === 'string') {
                    parsedScanData = JSON.parse(scannedValue);
                } else if (typeof scannedValue === 'object' && scannedValue !== null) {
                    parsedScanData = scannedValue;
                } else {
                    console.warn("Scanned QR data is not a string or object:", scannedValue);
                    return;
                }

                if (parsedScanData.type === "location" && parsedScanData.data) {
                    const { budova, podlazi, mistnost } = parsedScanData.data;
                    setSelectedBudova(budova ?? null);
                    setSelectedPodlazi(podlazi ?? null);
                    setSelectedMistnost(mistnost ? { id: mistnost } : null);
                } else {
                    console.warn("Scanned QR is not of type 'location' or data is missing.");
                }
            } catch (e) {
                console.error("Error parsing scanned QR data:", e);
            }
        }
        setIsScannerOpen(false);
    };

    const budovaOptions = buildings.map((b) => ({ value: b.id, text: b.text }));
    const selectedBuilding = buildings.find((b) => b.id === selectedBudova);
    const podlaziOptions = stories.map((s) => ({ value: s.id, text: s.text }));
    const selectedStory = stories.find((s) => s.id === selectedPodlazi);
    const mistnostOptions = rooms.map((r) => ({ value: r.id, text: r.text }));

    const selectedBudovaOption = budovaOptions.find((opt) => opt.value === selectedBudova) || null;
    const selectedPodlaziOption = podlaziOptions.find((opt) => opt.value === selectedPodlazi) || null;
    const selectedMistnostOption = mistnostOptions.find((opt) => opt.value === selectedMistnost?.id) || null;

    const handleBudovaSelect = (val) => {
        setSelectedBudova(val.value);
        setSelectedPodlazi(null);
        setSelectedMistnost(null);
    };

    const handlePodlaziSelect = (val) => {
        setSelectedPodlazi(val.value);
        setSelectedMistnost(null);
    };

    const handleMistnostSelect = (val) => {
        setSelectedMistnost({ id: val.value, text: val.text });
    };

    const handleSave = () => {
        onSave({
            budova: selectedBudova,
            podlazi: selectedPodlazi,
            mistnost: selectedMistnost?.id,
        });
        onClose();
    };

    return (
        <>
            {isOpen && (
                <CenteredModal isOpen={isOpen} onClose={onClose} title="Výběr lokace" disableClickAway={isScannerOpen}>
                    <div
                        className="container"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#282828",
                                color: "#fff",
                                border: "none",
                                borderRadius: "1rem",
                                padding: "0.75rem",
                                fontSize: "0.75rem",
                                cursor: "pointer"
                            }}
                        >
                            Nastavit přes QR kód
                            <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>qr_code</span>
                        </button>
                        <DropdownCard
                            label="Budova"
                            options={budovaOptions}
                            selected={selectedBudovaOption}
                            onSelect={handleBudovaSelect}
                        />
                        <DropdownCard
                            label="Podlaží"
                            options={podlaziOptions}
                            selected={selectedPodlaziOption}
                            onSelect={handlePodlaziSelect}
                            disabled={!selectedBudova}
                        />
                        <DropdownCard
                            label="Místnost"
                            options={mistnostOptions}
                            selected={selectedMistnostOption}
                            onSelect={handleMistnostSelect}
                            disabled={!selectedPodlazi}
                        />
                        <button
                            onClick={handleSave}
                            disabled={!selectedMistnost}
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#282828",
                                color: "#fff",
                                border: "none",
                                borderRadius: "1rem",
                                padding: "0.75rem",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                opacity: !selectedMistnost ? 0.5 : 1
                            }}
                        >
                            Uložit
                            <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>check</span>
                        </button>
                    </div>
                </CenteredModal>
            )}
            {isScannerOpen && (
                <QRScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScan={handleQRScan}
                    validate={(parsed) => {
                        if (parsed?.type === "location" && parsed.data) {
                            const { budova, podlazi, mistnost } = parsed.data;
                            return {
                                valid: true,
                                message: `Naskenováno: ${budova || "?"} / ${podlazi || "?"} / ${mistnost || "?"}`,
                                data: parsed.data,
                            };
                        }
                        return {
                            valid: false,
                            message: "QR kód neobsahuje data o lokaci.",
                        };
                    }}
                />
            )}
        </>
    );
}