import React, { useEffect, useRef } from "react";

export default function Modal({ 
    isOpen, 
    onClose, 
    children, 
    title, 
    style = {}, 
    contentStyle = {},
    titleStyle = {},
    height = "90vh"
}) {
    const modalRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 1000,
            transition: "background 0.3s ease-in-out",
            pointerEvents: isOpen ? "auto" : "none",
            opacity: isOpen ? 1 : 0,
            ...style
        }}>
            <div 
                ref={modalRef}
                style={{
                    background: "#f2f3f5",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    position: "relative",
                    width: "100vw",
                    maxWidth: "600px",
                    boxShadow: "0px -5px 15px rgba(0,0,0,0.2)",
                    height: height,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transform: isOpen ? "translateY(0%)" : "translateY(100%)",
                    transition: "transform 0.3s ease-in-out",
                    willChange: "transform"
                }}
            >
                {/* Header section */}
                {(title || onClose) && (
                    <div style={{
                        padding: "1rem",
                        paddingBottom: "0.5rem",
                        borderBottom: "1px solid #F0F0F0",
                        position: "relative",
                        ...titleStyle
                    }}>
                        {title && (
                            <h3 style={{
                                margin: 0,
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                textAlign: "center",
                                color: "#000"
                            }}>
                                {title}
                            </h3>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                background: "rgba(0, 0, 0, 0.1)",
                                borderRadius: "50%",
                                width: "30px",
                                height: "30px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#000",
                                zIndex: 1000,
                                transition: "background 0.15s ease-in-out"
                            }}
                            className="hover:bg-gray-200 active:bg-gray-300"
                        >
                            <span className="material-icons-round" style={{ fontSize: "18px" }}>
                                close
                            </span>
                        </button>
                    </div>
                )}
                
                {/* Content section */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1rem",
                    ...contentStyle
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}