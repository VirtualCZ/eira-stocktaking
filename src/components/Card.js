import React from "react";
export default function Card({ nameStyle, name, children, style }) {
    return (
        <section
            style={{
                background: "#fff",
                borderRadius: "1rem",
                padding: "1rem",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
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