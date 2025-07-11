"use client"
import React, { useState, useEffect, useRef } from "react";
import { useBuildings, useStoreys, useRooms } from "../../hooks/useBuildings";
import QRScannerModal from "@/components/organisms/QRScannerModal";
import DropdownCard from "@/components/molecules/DropdownCard";
import CenteredModal from "@/components/molecules/CenteredModal";

export default function LocationPickerModal({ isOpen, onClose, onSave, initialLocation }) {
    const [buildings] = useBuildings();
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [selectedStorey, setSelectedStorey] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const prevIsOpen = useRef(isOpen);

    const [storeys] = useStoreys(selectedBuilding);
    const [rooms] = useRooms(selectedBuilding, selectedStorey);

    useEffect(() => {
        if (isOpen && !prevIsOpen.current) {
            if (initialLocation) {
                const { building, storey, room } = initialLocation;
                setSelectedBuilding(building ?? null);
                setSelectedStorey(storey ?? null);
                setSelectedRoom(room ? { id: room } : null);
            } else {
                setSelectedBuilding(null);
                setSelectedStorey(null);
                setSelectedRoom(null);
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
                    const { building, storey, room } = parsedScanData.data;
                    setSelectedBuilding(building ?? null);
                    setSelectedStorey(storey ?? null);
                    setSelectedRoom(room ? { id: room } : null);
                } else {
                    console.warn("Scanned QR is not of type 'location' or data is missing.");
                }
            } catch (e) {
                console.error("Error parsing scanned QR data:", e);
            }
        }
        setIsScannerOpen(false);
    };

    const buildingOptions = buildings.map((b) => ({ value: b.id, text: b.text }));
    const storeyOptions = storeys.map((s) => ({ value: s.id, text: s.text }));
    const roomOptions = rooms.map((r) => ({ value: r.id, text: r.text }));

    const selectedBuildingOption = buildingOptions.find((opt) => opt.value === selectedBuilding) || null;
    const selectedStoreyOption = storeyOptions.find((opt) => opt.value === selectedStorey) || null;
    const selectedRoomOption = roomOptions.find((opt) => opt.value === selectedRoom?.id) || null;

    const handleBuildingSelect = (val) => {
        setSelectedBuilding(val.value);
        setSelectedStorey(null);
        setSelectedRoom(null);
    };

    const handleStoreySelect = (val) => {
        setSelectedStorey(val.value);
        setSelectedRoom(null);
    };

    const handleRoomSelect = (val) => {
        setSelectedRoom({ id: val.value, text: val.text });
    };

    const handleSave = () => {
        onSave({
            building: selectedBuilding,
            storey: selectedStorey,
            room: selectedRoom?.id,
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
                            label="Building"
                            options={buildingOptions}
                            selected={selectedBuildingOption}
                            onSelect={handleBuildingSelect}
                        />
                        <DropdownCard
                            label="Storey"
                            options={storeyOptions}
                            selected={selectedStoreyOption}
                            onSelect={handleStoreySelect}
                            disabled={!selectedBuilding}
                        />
                        <DropdownCard
                            label="Room"
                            options={roomOptions}
                            selected={selectedRoomOption}
                            onSelect={handleRoomSelect}
                            disabled={!selectedStorey}
                        />
                        <button
                            onClick={handleSave}
                            disabled={!selectedRoom}
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
                                opacity: !selectedRoom ? 0.5 : 1
                            }}
                        >
                            Save
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
                            const { building, storey, room } = parsed.data;
                            return {
                                valid: true,
                                message: `Naskenováno: ${building || "?"} / ${storey || "?"} / ${room || "?"}`,
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