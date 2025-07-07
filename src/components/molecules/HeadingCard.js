import React from "react";
import Link from "next/link";

export default function HeadingCard({
    heading,
    leftActions = [],
    rightActions = [],
    extraRow = null
}) {
    // Helper function to render action button or link
    const renderAction = (action, idx, position) => {
        const commonStyle = {
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
        };

        if (action.href) {
            return (
                <Link
                    key={`${position}-${idx}`}
                    href={action.href}
                    style={commonStyle}
                >
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                        {action.icon}
                    </span>
                </Link>
            );
        }

        return (
            <button
                key={`${position}-${idx}`}
                onClick={action.onClick}
                style={commonStyle}
            >
                <span className="material-icons-round" style={{ fontSize: 16 }}>
                    {action.icon}
                </span>
            </button>
        );
    };

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
                        leftActions.map((action, idx) => renderAction(action, idx, 'left'))
                    ) : (
                        <div style={{ width: 32, height: 32 }} />
                    )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {rightActions.length > 0 &&
                        rightActions.map((action, idx) => renderAction(action, idx, 'right'))}
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
