import React from "react";
export default function Card({ nameStyle, name, children, style }) {
    return (
        <section
            style={{
                background: "#f0f1f3",
                borderRadius: "1rem",
                padding: "1rem",
                width: "100%",
                gap: "1rem",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                ...style
            }}>
            {name && (
                <header
                    style={{
                        color: "#4E5058",
                        fontWeight: 600,
                        fontSize: "1rem",
                        ...nameStyle
                    }}
                >
                    {name}
                </header>
            )}
            {children}
        </section>
    );
}