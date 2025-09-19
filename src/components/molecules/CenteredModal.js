import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function CenteredModal({
    isOpen,
    onClose,
    children,
    title,
    style = {},
    contentStyle = {},
    titleStyle = {},
    width = "90vw",
    height = "auto",
    disableClickAway = false
}) {
    const modalRef = useRef(null);

    // Handle click outside
    useEffect(() => {
        if (disableClickAway || !isOpen) return;
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, disableClickAway]);

    // Handle background scroll prevention
    useEffect(() => {
        if (isOpen) {
            // Store current scroll position
            const scrollY = window.scrollY;
            
            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            
            return () => {
                // Restore scroll position and styles
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    const modalContent = (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100dvh",
            background: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            transition: "background 0.3s ease-in-out",
            pointerEvents: isOpen ? "auto" : "none",
            opacity: isOpen ? 1 : 0,
            ...style
        }}>
            <div
                className="container"
                ref={modalRef}
                style={{
                    padding: "1rem",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <div style={{
                    background: "#fff",
                    borderRadius: "1rem",
                    position: "relative",
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                    minHeight: 40,
                    height: height === "auto" ? "auto" : height,
                    maxHeight: "calc(100dvh - 2rem)",
                    width: width,
                    maxWidth: "calc(100vw - 2rem)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transform: isOpen ? "scale(1)" : "scale(0.95)",
                    transition: "transform 0.3s ease-in-out",
                    willChange: "transform",
                }}>
                    {/* Header section */}
                    {(title || onClose) && (
                        <div style={{
                            padding: "1rem",
                            paddingBottom: 0,
                            position: "relative",
                            ...titleStyle
                        }}>
                            {title && (
                                <h3 style={{
                                    margin: 0,
                                    fontSize: "1rem",
                                    fontWeight: 700,
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
                        overflow: "auto",
                        overscrollBehavior: "contain",
                        WebkitOverflowScrolling: "touch",
                        touchAction: "pan-y",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        ...contentStyle
                    }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );

    // Use portal to render at document body level
    if (typeof window !== 'undefined' && isOpen) {
        return createPortal(modalContent, document.body);
    }

    return null;
} 