import React, { useState, useEffect, useRef } from "react";
import CardContainer from "../atoms/CardContainer";
import CenteredModal from "../molecules/CenteredModal";
import Checkbox from "../atoms/Checkbox";

const stateOptions = [
    { label: "Zbývá", value: "zbyva" },
    { label: "Nalezeno", value: "nalezeno" },
    { label: "Přesun", value: "presun" },
    { label: "Nový", value: "novy" },
];
const hasNoteOptions = [
    { label: "Ano", value: "yes" },
    { label: "Ne", value: "no" },
];

export default function FilterOptionsModal({
    isOpen,
    onClose,
    initialState = [],
    initialHasNote = [],
    onChange
}) {
    const [state, setState] = useState(initialState);
    const [hasNote, setHasNote] = useState(initialHasNote);
    const prevIsOpen = useRef(isOpen);

    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            setState(initialState);
            setHasNote(initialHasNote);
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, initialState, initialHasNote]);

    const handleStateChange = (value) => {
        setState((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };
    const handleHasNoteChange = (value) => {
        setHasNote((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleOk = () => {
        if (onChange) {
            onChange({ state, hasNote });
        }
        onClose();
    };

    return (
        <CenteredModal title="Filtry" isOpen={isOpen} onClose={onClose} height="auto">
            <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                <CardContainer className="gap-2">
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}>Stav</div>
                    {stateOptions.map((opt) => (
                        <Checkbox
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                            checked={state.includes(opt.value)}
                            onChange={handleStateChange}
                            name="filterState"
                        />
                    ))}
                </CardContainer>
                <CardContainer className="gap-2">
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}>Má poznámku</div>
                    {hasNoteOptions.map((opt) => (
                        <Checkbox
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                            checked={hasNote.includes(opt.value)}
                            onChange={handleHasNoteChange}
                            name="filterHasNote"
                        />
                    ))}
                </CardContainer>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                    <button
                        onClick={handleOk}
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
                        OK
                        <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>check</span>
                    </button>
                </div>
            </div>
        </CenteredModal>
    );
} 