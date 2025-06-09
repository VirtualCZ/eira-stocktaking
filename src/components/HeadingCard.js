import React from "react";

export default function HeadingCard({
    heading,
    leftActions = [],
    rightActions = [],
    extraRow = null
}) {
    return (
        <div
            style={{
                background: "#000",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%"
            }}
        >
            {/* Actions row: left and right */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: 38
                }}
            >
                <div style={{ display: "flex", gap: 8 }}>
                    {leftActions.length > 0 ? (
                        leftActions.map((action, idx) => (
                            <button
                                key={`left-${idx}`}
                                onClick={action.onClick}
                                style={{
                                    background: "#282828",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 16,
                                    width: 38,
                                    height: 38,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                    cursor: "pointer"
                                }}
                            >
                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                    {action.icon}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div style={{ width: 32, height: 32 }} />
                    )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {rightActions.length > 0 &&
                        rightActions.map((action, idx) => (
                            <button
                                key={`right-${idx}`}
                                onClick={action.onClick}
                                style={{
                                    background: "#282828",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 16,
                                    width: 38,
                                    height: 38,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                    cursor: "pointer"
                                }}
                            >
                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                    {action.icon}
                                </span>
                            </button>
                        ))}
                </div>
            </div>

            {/* Heading and optional extra row */}
            <div className="flex flex-col gap-2">
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 32 }}>{heading}</div>
                {extraRow && (
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{extraRow}</div>
                )}
            </div>
        </div>
    );
}
