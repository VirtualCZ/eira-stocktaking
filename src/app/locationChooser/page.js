"use client"
import { useState } from "react";
import DropdownCard from "../../components/DropdownCard";
import NavCard from "@/components/NavCard";

const buildings = [
    {
        value: "A",
        text: "Budova A",
        stories: [
            {
                value: "1",
                text: "1. podlaží",
                rooms: [
                    { value: "101", text: "Místnost 101 v budově A" },
                    { value: "102", text: "Místnost 102 v budově A" }
                ]
            },
            {
                value: "2",
                text: "2. podlaží",
                rooms: [
                    { value: "201", text: "Místnost 201 v budově A" },
                    { value: "202", text: "Místnost 202 v budově A" }
                ]
            }
        ]
    },
    {
        value: "B",
        text: "Budova B",
        stories: [
            {
                value: "1",
                text: "1. podlaží",
                rooms: [
                    { value: "103", text: "Místnost 103 v budově B" },
                    { value: "104", text: "Místnost 104 v budově B" }
                ]
            },
            {
                value: "3",
                text: "3. podlaží",
                rooms: [
                    { value: "301", text: "Místnost 301 v budově B" },
                    { value: "302", text: "Místnost 302 v budově B" }
                ]
            }
        ]
    }
];

export default function LocationChooser() {
    const [selectedBudova, setSelectedBudova] = useState(null);
    const [selectedPodlazi, setSelectedPodlazi] = useState(null);
    const [selectedMistnost, setSelectedMistnost] = useState(null);

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
                <h1
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                    }}>
                    Výběr lokace
                </h1>
                <NavCard
                    items={[
                        { icon: "qr_code_scanner", text: "Skenovat QR kód", href: "/scanQR" }
                    ]}
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