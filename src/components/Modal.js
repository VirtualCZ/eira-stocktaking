import React from "react";
export default function Modal({ isOpen, onClose, children, style = {}, contentStyle = {} }) {
    if (!isOpen) return null;
    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0,0,0,0)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 1000,
            transition: "background 0.3s ease-in-out",
            pointerEvents: isOpen ? "auto" : "none",
        }}>
            <div style={{
                background: "#ffffff",
                padding: "20px",
                paddingTop: "50px",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                textAlign: "center",
                position: "relative",
                width: "100vw",
                maxWidth: "600px",
                boxShadow: "0px -5px 15px rgba(0,0,0,0.2)",
                transform: isOpen ? "translateY(0%)" : "translateY(100%)",
                transition: "transform 0.3s ease-in-out",
                height: "75vh",
                display: "flex",
                flexDirection: "column",
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "rgba(0, 0, 0, 0.53)",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        zIndex: 1000
                    }}
                >
                    <span className="material-icons-round" style={{ fontSize: "18px" }}>
                        close
                    </span>
                </button>
                {children}
            </div>
        </div>
    );
}