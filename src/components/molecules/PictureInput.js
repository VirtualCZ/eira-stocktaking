import React, { useRef, useState, useEffect } from "react";
import { useItemImage } from "@/hooks/useItemImage";

function PictureInputButton({ onClick, title, children, style = {}, ...rest }) {
    return (
        <button
            type="button"
            onClick={onClick}
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
    const inputRef = useRef();
    const imageRef = useRef();

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

    const handleFile = e => {
        const file = e.target.files[0];
        if (file) {
            // Check if file type is allowed
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Povolené formáty obrázků jsou: JPEG, PNG, GIF, WebP');
                return;
            }
            onChange && onChange(file);
        }
    };
    const handleDelete = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        onChange && onChange(null);
    };
    const toggleObjectFit = () => {
        setObjectFit(fit => fit === "cover" ? "contain" : "cover");
    };
    return (
        <div style={{ position: "relative", width: "100%" }}>
            {label && <label style={{ display: "block", fontWeight: 600, marginBottom: "1rem" }}>{label}</label>}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" capture="environment" style={{ display: "none" }} onChange={handleFile} />
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
                {/* Absolute top right: camera/plus, fit switch, and trash buttons */}
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
                            <PictureInputButton onClick={() => inputRef.current.click()}>
                                <span className="material-icons-round" style={{ color: "#fff", fontSize: 14 }}>add_a_photo</span>
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
        </div>
    );
}