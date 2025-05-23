import React from "react";
export default function TextInput({ label, ...props }) {
    return (
        <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "1rem" }}>{label}</label>
            <input type="text"
                {...props}
                style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "1rem",
                    backgroundColor: "#e3e3e3",
                    fontSize: "1rem",
                    outline: "none"
                }}
            />
        </div>
    );
}