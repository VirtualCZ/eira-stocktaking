"use client"
import { useState } from "react";
import CardContainer from "./CardContainer";

export default function DropdownCard({ label, options = [], onSelect, selected, disabled = false }) {
    const [open, setOpen] = useState(false);
    const handleDropdownClick = () => {
        if (!disabled) setOpen((v) => !v);
    };
    return (
        <CardContainer style={{ padding: "0" }}>
            <button
                className=""
                style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    transition: "background 0.15s",
                    borderRadius: "0.5rem",
                    color: "#000",
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer"
                }}
                onClick={handleDropdownClick}
                type="button"
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
            >
                <span>{selected ? selected.text : label}</span>
                <span className="material-icons-round"
                    style={{ fontSize: "20px", color: "#000", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : undefined }}
                >
                    expand_more
                </span>
            </button>
            {open && options.length > 0 && !disabled && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {options.map((option, idx) => (
                        <li key={option.value}>
                            <button
                                className="w-full text-left hover:bg-gray-100 transition-colors"
                                style={{ fontWeight: 500, fontSize: "0.75rem", color: "#000", border: "none", background: "none", padding: "0.75rem" }}
                                onClick={() => { setOpen(false); onSelect && onSelect(option); }}
                                type="button"
                            >
                                {option.text}
                            </button>
                            {idx !== options.length - 1 && (
                                <div style={{ borderBottom: "1px solid #F0F0F0", marginLeft: 0, marginRight: 0 }} />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </CardContainer>
    );
}