"use client"
import { useEffect, useState } from "react";
import { useBuildings } from "@/hooks/useBuildings";
import { useSetLocation, useGetLocation } from "@/hooks/useLocation";
import DropdownCard from "@/components/DropdownCard";
import Button from "@/components/Button";
import QRScannerModal from "@/components/QRScannerModal";
import PageHeading from "@/components/PageHeading";

export default function LocationChooser() {
    const setLocation = useSetLocation();
    const getLocation = useGetLocation();
    const buildings = useBuildings();
    const [selectedBudova, setSelectedBudova] = useState(null);
    const [selectedPodlazi, setSelectedPodlazi] = useState(null);
    const [selectedMistnost, setSelectedMistnost] = useState(null);

    const [isScannerOpen, setIsScannerOpen] = useState(false); // State for modal visibility
    const openScanner = () => setIsScannerOpen(true);
    const closeScanner = () => setIsScannerOpen(false);

    useEffect(() => {
        const stored = getLocation();
        if (stored) {
            const { budova, podlazi, mistnost } = stored;

            // Validate stored values exist in the buildings data
            const building = buildings.find(b => b.value === budova);
            const story = building?.stories.find(s => s.value === podlazi);
            const room = story?.rooms.find(r => r.value === mistnost);

            if (building && story && room) {
                setSelectedBudova(budova);
                setSelectedPodlazi(podlazi);
                setSelectedMistnost({ value: room.value, text: room.text });
            }
        }
    }, [getLocation]);

    useEffect(() => {
        if (selectedBudova && selectedPodlazi && selectedMistnost) {
            setLocation({
                budova: selectedBudova,
                podlazi: selectedPodlazi,
                mistnost: selectedMistnost.value,
            });
        }
    }, [selectedBudova, selectedPodlazi, selectedMistnost, setLocation]);

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
        closeScanner(); // Close modal after processing
    };

    const budovaOptions = buildings.map(b => ({ value: b.value, text: b.text }));
    const selectedBuilding = buildings.find(b => b.value === selectedBudova);
    const podlaziOptions = selectedBuilding?.stories.map(s => ({ value: s.value, text: s.text })) ?? [];
    const selectedStory = selectedBuilding?.stories.find(s => s.value === selectedPodlazi);
    const mistnostOptions = selectedStory?.rooms.map(r => ({ value: r.value, text: r.text })) ?? [];

    // Compute selected option objects for each dropdown
    const selectedBudovaOption = budovaOptions.find(opt => opt.value === selectedBudova) || null;
    const selectedPodlaziOption = podlaziOptions.find(opt => opt.value === selectedPodlazi) || null;
    const selectedMistnostOption = mistnostOptions.find(opt => opt.value === selectedMistnost?.value) || null;

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

    return (
        <div
            className="relative min-h-screen flex flex-col items-center"
            style={{
                background: "#F2F3F5",
            }}
        >
            <main
                className="container"
                style={{
                    minHeight: "100vh",
                    background: "#F2F3F5",
                    display: "flex",
                    padding: "1rem",
                    flexDirection: "column",
                    gap: "1rem"
                }}
            >
                <PageHeading heading="Výběr lokace" route="/" />

                <Button
                    icon="qr_code_scanner"
                    onClick={openScanner}
                    style={{ marginBottom: "1rem" }} // Optional: add some margin if needed
                >
                    Skenovat QR kód
                </Button>
                <QRScannerModal
                    isOpen={isScannerOpen}
                    onClose={closeScanner}
                    onScan={handleQRScan}
                    validate={parsed => {
                        if (parsed.type === "location" && parsed.data) {
                            const { budova, podlazi, mistnost } = parsed.data;
                            return {
                                valid: true,
                                message: `Naskenováno: ${budova || "?"} / ${podlazi || "?"} / ${mistnost || "?"}`,
                                data: parsed.data
                            };
                        }
                        return { valid: false, message: "QR kód neobsahuje data o lokaci." };
                    }}
                />
                <DropdownCard
                    label="Budova"
                    options={budovaOptions}
                    selected={selectedBudovaOption}
                    onSelect={handleBudovaSelect}
                    disabled={false}
                />
                <DropdownCard
                    label="Podlaží"
                    options={podlaziOptions}
                    selected={selectedPodlaziOption}
                    onSelect={handlePodlaziSelect}
                    disabled={selectedBudova === null}
                />
                <DropdownCard
                    label="Místnost"
                    options={mistnostOptions}
                    selected={selectedMistnostOption}
                    onSelect={handleMistnostSelect}
                    disabled={selectedPodlazi === null}
                />
            </main>
        </div>
    );
}
