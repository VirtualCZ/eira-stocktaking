import React, { useRef, useState, useEffect, useCallback } from "react";
import { useItemImage } from "@/hooks/useItemImage";
import { processImageForEira } from "@/utils/processImageForEira";
import CenteredModal from "@/components/molecules/CenteredModal";

function PictureInputButton({ onClick, title, children, style = {}, disabled = false, ...rest }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                borderRadius: "1rem",
                padding: "0.75rem",
                background: "#000",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                ...style
            }}
            className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
            title={title}
            {...rest}
        >
            {children}
        </button>
    );
}

export default function PictureInput({ label, onChange, value, editMode = false, itemId = null }) {
    const [preview, setPreview] = useState(null);
    const [objectFit, setObjectFit] = useState("cover");
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "" });
    const fileInputRef = useRef();
    const imageRef = useRef();

    const closeMessageModal = useCallback(() => {
        setMessageModal((m) => ({ ...m, open: false }));
    }, []);

    const openMessageModal = useCallback((title, message) => {
        setMessageModal({ open: true, title, message });
    }, []);

    const clearFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        if (!value) {
            setPreview(null);
        } else if (typeof value === "string") {
            // If value looks like a base64 string (not a URL or file path)
            if (/^data:image\//.test(value)) {
                setPreview(value);
            } else if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100) {
                // crude check for base64 string
                setPreview(`data:image/*;base64,${value}`);
            } else {
                setPreview(value);
            }
        } else if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [value]);

    const { containerRef, imageSrc, isWaitingForLazyImage } = useItemImage({
        itemId,
        itemImage: preview,
        compact: false,
        enableLazyImageFetch: false,
        fetchByIdWhenMissing: true,
    });
    const showLoadingPlaceholder = isWaitingForLazyImage || (!!imageSrc && !imageLoaded && !imageError);

    useEffect(() => {
        setImageLoaded(false);
        setImageError(false);
    }, [imageSrc, itemId]);

    useEffect(() => {
        if (!imageSrc) return;
        const img = imageRef.current;
        if (!img) return;
        if (img.complete) {
            if (img.naturalWidth > 0) setImageLoaded(true);
            else setImageError(true);
        }
    }, [imageSrc]);

    const handleFile = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const name = (file.name || "").toLowerCase();
        const looksImage =
            (file.type && file.type.startsWith("image/")) ||
            /\.(jpe?g|png|gif|webp|bmp|heic|heif|tif{1,2})$/i.test(name);

        if (!looksImage) {
            openMessageModal(
                "Vyberte obrázek",
                "Vyberte prosím obrázek.\n\n" +
                    "Formáty, které se ukládají přímo: JPEG, PNG, GIF, WebP.\n\n" +
                    "Z jiných formátů (např. HEIC nebo HEIF z iPhonu, BMP, TIFF) se fotka před nahráním " +
                    "automaticky převede na JPEG a upraví se velikost."
            );
            clearFileInput();
            return;
        }

        setProcessing(true);
        try {
            const dataUrl = await processImageForEira(file);
            onChange && onChange(dataUrl);
        } catch (err) {
            openMessageModal("Chyba", err instanceof Error ? err.message : String(err));
        } finally {
            setProcessing(false);
            clearFileInput();
        }
    };
    const handleDelete = () => {
        setPreview(null);
        clearFileInput();
        onChange && onChange(null);
    };
    const toggleObjectFit = () => {
        setObjectFit(fit => fit === "cover" ? "contain" : "cover");
    };
    return (
        <div style={{ position: "relative", width: "100%" }}>
            {label && <label style={{ display: "block", fontWeight: 600, marginBottom: "1rem" }}>{label}</label>}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                style={{ display: "none" }}
                onChange={handleFile}
                disabled={processing}
            />
            <picture style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 280,
                position: "relative",
                overflow: "hidden"
            }}
            ref={containerRef}
            >
                {processing ? (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.85)",
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#333",
                            zIndex: 3
                        }}
                    >
                        Zpracovávám fotku…
                    </div>
                ) : null}
                {imageSrc && !imageError ? (
                    <>
                        {showLoadingPlaceholder && (
                            <div
                                className="image-placeholder-pulse"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                                    backgroundSize: "200% 100%",
                                    borderRadius: 12
                                }}
                            />
                        )}
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="preview"
                            loading="eager"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit,
                                borderRadius: 12,
                                visibility: imageLoaded ? "visible" : "hidden"
                            }}
                        />
                    </>
                ) : (
                    isWaitingForLazyImage ? (
                        <div
                            className="image-placeholder-pulse"
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                                backgroundSize: "200% 100%",
                                borderRadius: 12
                            }}
                        />
                    ) : (
                        <span style={{ color: "#000", opacity: "50%", fontSize: 32 }} className="material-icons-round">image_not_supported</span>
                    )
                )}
                {/* Absolute top right: pick photo, fit switch, trash */}
                <div style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    zIndex: 2
                }}>
                    <PictureInputButton
                        onClick={toggleObjectFit}
                        title={objectFit === "cover" ? "Přepnout na obsah (contain)" : "Přepnout na oříznutí (cover)"}
                    >
                        <span className="material-icons-round" style={{ color: "#fff", fontSize: 14 }}>{objectFit === "cover" ? "fit_screen" : "crop"}</span>
                    </PictureInputButton>
                    {editMode && (
                        <>
                            <PictureInputButton
                                onClick={() => !processing && fileInputRef.current?.click()}
                                disabled={processing}
                                title="Vybrat fotku (galerie nebo fotoaparát)"
                            >
                                <span className="material-icons-round" style={{ color: "#fff", fontSize: 14 }}>photo_library</span>
                            </PictureInputButton>
                            <PictureInputButton onClick={handleDelete}>
                                <span className="material-icons-round" style={{ color: "#FF6262", fontSize: 14 }}>delete</span>
                            </PictureInputButton>
                        </>
                    )}
                </div>
            </picture>
            <style jsx>{`
                .image-placeholder-pulse {
                    animation: imagePlaceholderPulse 1.2s linear infinite;
                }
                @keyframes imagePlaceholderPulse {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            <CenteredModal isOpen={messageModal.open} onClose={closeMessageModal} title={messageModal.title}>
                <div
                    style={{
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: "#333",
                        whiteSpace: "pre-line",
                    }}
                >
                    {messageModal.message}
                </div>
            </CenteredModal>
        </div>
    );
}