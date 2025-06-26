"use client"
import React, { useState, useEffect } from "react";
import { useBuildings } from "../../hooks/useBuildings";
import QRScannerModal from "../QRScannerModal";
import DropdownCard from "../DropdownCard";
import CenteredModal from "../CenteredModal";

export default function LocationPickerModal({ isOpen, onClose, onSave, initialLocation }) {
    const buildings = useBuildings();

    const [selectedBudova, setSelectedBudova] = useState(null);
    const [selectedPodlazi, setSelectedPodlazi] = useState(null);
    const [selectedMistnost, setSelectedMistnost] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);


    useEffect(() => {
        if (initialLocation) {
            const { budova, podlazi, mistnost } = initialLocation;

            const building = buildings.find((b) => b.value === budova);
            const story = building?.stories.find((s) => s.value === podlazi);
            const room = story?.rooms.find((r) => r.value === mistnost);

            if (building && story && room) {
                setSelectedBudova(budova);
                setSelectedPodlazi(podlazi);
                setSelectedMistnost({ value: room.value, text: room.text });
            }
        }
    }, [initialLocation, buildings]);


    const handleQRScan = (scannedValue) => {
        if (scannedValue) {
            try {
                let parsedScanData;
                if (typeof scannedValue === 'string') {
                    parsedScanData = JSON.parse(scannedValue);
                } else if (typeof scannedValue === 'object' && scannedValue !== null) {
                    parsedScanData = scannedValue; // Already an object
                } else {
                    console.warn("Scanned QR data is not a string or object:", scannedValue);
                    return; // Or handle as an error
                }

                if (parsedScanData.type === "location" && parsedScanData.data) {
                    const { budova, podlazi, mistnost } = parsedScanData.data;

                    // Validate if the scanned location exists in our predefined buildings data
                    const buildingExists = buildings.find(b => b.value === budova);
                    const storyExists = buildingExists?.stories.find(s => s.value === podlazi);
                    const roomExists = storyExists?.rooms.find(r => r.value === mistnost);

                    if (buildingExists && storyExists && roomExists) {
                        setSelectedBudova(budova);
                        setSelectedPodlazi(podlazi);
                        // Find the correct room text for display consistency if needed, or just use the value
                        const roomObj = roomExists; // Or mistnostOptions.find(r => r.value === mistnost);
                        setSelectedMistnost({ value: roomObj.value, text: roomObj.text });
                    } else {
                        console.warn("Scanned location not found in predefined data:", parsedScanData.data);
                        // Optionally, provide user feedback about invalid location
                    }
                } else {
                    console.warn("Scanned QR is not of type 'location' or data is missing.");
                    // Optionally, provide user feedback about invalid QR type
                }
            } catch (e) {
                console.error("Error parsing scanned QR data:", e);
                // Optionally, provide user feedback about QR parsing error
            }
        }
        setIsScannerOpen(false);
    };

    const budovaOptions = buildings.map((b) => ({
        value: b.value,
        text: b.text,
    }));
    const selectedBuilding = buildings.find((b) => b.value === selectedBudova);
    const podlaziOptions =
        selectedBuilding?.stories.map((s) => ({ value: s.value, text: s.text })) ??
        [];
    const selectedStory = selectedBuilding?.stories.find(
        (s) => s.value === selectedPodlazi
    );
    const mistnostOptions =
        selectedStory?.rooms.map((r) => ({ value: r.value, text: r.text })) ?? [];

    const selectedBudovaOption =
        budovaOptions.find((opt) => opt.value === selectedBudova) || null;
    const selectedPodlaziOption =
        podlaziOptions.find((opt) => opt.value === selectedPodlazi) || null;
    const selectedMistnostOption =
        mistnostOptions.find((opt) => opt.value === selectedMistnost?.value) ||
        null;

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
        setSelectedMistnost(val);
    };

    const handleSave = () => {
        onSave({
            budova: selectedBudova,
            podlazi: selectedPodlazi,
            mistnost: selectedMistnost?.value,
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