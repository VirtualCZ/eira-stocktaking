import React from "react";

export default function SpecialHeadingCard({ heading, actions = [], extraRow = null }) {
    return (
        <div
            style={{
                background: "#000",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: extraRow ? 8 : 16,
                width: "100%"
            }}
        >
            {/* Action buttons row */}
            <div style={{ display: "flex", gap: 8, minHeight: 32, alignItems: "center" }}>
                {actions.length > 0 ? (
                    actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            style={{
                                background: "#282828",
                                color: "#fff",
                                border: "none",
                                borderRadius: 16,
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                                cursor: "pointer"
                            }}
                        >
                            <span className="material-icons-round" style={{ fontSize: 14 }}>
                                {action.icon}
                            </span>
                        </button>
                    ))
                ) : (
                    // Placeholder for consistent height/spacing
                    <div style={{ width: 32, height: 32 }} />
                )}
            </div>
            {/* Heading row */}
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 32 }}>{heading}</div>
            {/* Optional extra row for first page */}
            {extraRow && (
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{extraRow}</div>
            )}
        </div>
    );
}