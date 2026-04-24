import React, { useState, useEffect, useRef } from "react";
import CardContainer from "../atoms/CardContainer";
import CenteredModal from "../molecules/CenteredModal";
import Checkbox from "../atoms/Checkbox";

const stateOptions = [
    { label: "Zbývá", value: "zbyva" },
    { label: "Nalezeno", value: "nalezeno" },
    { label: "Přesun", value: "presun" },
    { label: "Nezkontrolováno", value: "nezkontrolováno" },
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
        <CenteredModal title="Filtry" isOpen={isOpen} onClose={onClose} height="auto" width="90vw">
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                height: "100%", 
                width: "100%",
                minHeight: "40px"
            }}>
                {/* Scrollable content */}
                <div style={{ 
                    flex: 1, 
                    overflow: "auto", 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "1.5rem",
                    minHeight: 0
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                            Stav:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {stateOptions.map((opt) => (
                                <label
                                    key={opt.value}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid #e0e0e0",
                                        backgroundColor: state.includes(opt.value) ? "#f8f9fa" : "white",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        fontSize: "0.875rem",
                                        fontWeight: "500"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!state.includes(opt.value)) {
                                            e.target.style.backgroundColor = "#f5f5f5";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!state.includes(opt.value)) {
                                            e.target.style.backgroundColor = "white";
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={state.includes(opt.value)}
                                        onChange={() => handleStateChange(opt.value)}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            accentColor: "#282828",
                                            cursor: "pointer"
                                        }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                            Má poznámku:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {hasNoteOptions.map((opt) => (
                                <label
                                    key={opt.value}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid #e0e0e0",
                                        backgroundColor: hasNote.includes(opt.value) ? "#f8f9fa" : "white",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        fontSize: "0.875rem",
                                        fontWeight: "500"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!hasNote.includes(opt.value)) {
                                            e.target.style.backgroundColor = "#f5f5f5";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!hasNote.includes(opt.value)) {
                                            e.target.style.backgroundColor = "white";
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={hasNote.includes(opt.value)}
                                        onChange={() => handleHasNoteChange(opt.value)}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            accentColor: "#282828",
                                            cursor: "pointer"
                                        }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* OK button - OUTSIDE scrollable area */}
                <div style={{ 
                    flexShrink: 0,
                    borderTop: "1px solid #e0e0e0",
                    paddingTop: "1rem",
                    marginTop: "1rem"
                }}>
                    <button
                        onClick={handleOk}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#282828",
                            color: "#fff",
                            border: "none",
                            borderRadius: "1rem",
                            padding: "0.75rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#1a1a1a";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#282828";
                        }}
                    >
                        OK
                        <span className="material-icons-round" style={{ fontSize: "18px" }}>check</span>
                    </button>
                </div>
            </div>
        </CenteredModal>
    );
} 