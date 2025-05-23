import React from "react";
export default function Button({ children, icon, ...props }) {
    return (
        <button {...props} style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: 100,
            background: "#b640ff",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1
        }}
            className="hover:opacity-80 active:opacity-80 focus:opacity-80">
            {icon && <span className="material-icons-round" style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>{icon}</span>}
            {children}
        </button>
    );
}