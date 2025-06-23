import React, { useRef, useState, useEffect } from "react";
export default function PictureInput({ label, onChange, value, editMode = false }) {
    const [preview, setPreview] = useState(value || null);
    const [objectFit, setObjectFit] = useState("cover");
    const inputRef = useRef();

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const handleFile = e => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
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
            <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
            <picture style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 280,
                position: "relative",
                overflow: "hidden"
            }}>
                {preview ? (
                    <img src={typeof preview === 'string' ? preview : ''} alt="preview" style={{ width: "100%", height: "100%", objectFit, borderRadius: 12 }} />
                ) : (
                    <span style={{ color: "#000", opacity: "50%", fontSize: 32 }} className="material-icons-round">broken_image</span>
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
                    <button
                        type="button"
                        onClick={toggleObjectFit}
                        style={{
                            borderRadius: "1rem",
                            padding: "0.75rem",
                            background: "#000",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                        }}
                        title={objectFit === "cover" ? "Přepnout na obsah (contain)" : "Přepnout na oříznutí (cover)"}
                        className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
                    >
                        <span className="material-icons-round" style={{ color: "#fff", fontSize: 14 }}>{objectFit === "cover" ? "fit_screen" : "crop"}</span>
                    </button>
                    {editMode && (
                        <>
                            <button
                                type="button"
                                onClick={() => inputRef.current.click()}
                                style={{
                                    borderRadius: "1rem",
                                    padding: "0.75rem",
                                    background: "#000",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                }}
                                className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
                            >
                                <span className="material-icons-round" style={{ color: "#fff", fontSize: 14 }}>add_a_photo</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                style={{
                                    borderRadius: "1rem",
                                    padding: "0.75rem",
                                    background: "#000",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                }}
                                className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
                            >
                                <span className="material-icons-round" style={{ color: "#FF6262", fontSize: 14 }}>delete</span>
                            </button>
                        </>
                    )}
                </div>
            </picture>
        </div>
    );
}