import React, { useRef, useState } from "react";
export default function PictureInput({ label, onChange }) {
    const [preview, setPreview] = useState(null);
    const inputRef = useRef();
    const handleFile = e => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onChange && onChange(file);
        }
    };
    const handleDelete = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        onChange && onChange(null);
    };
    return (
        <div style={{ position: "relative", width: "100%" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "1rem" }}>{label}</label>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
            <picture style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 200,
                background: "#e3e3e3",
                borderRadius: 12,
                marginBottom: 8,
                position: "relative",
                overflow: "hidden"
            }}>
                {preview ? (
                    <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                ) : (
                    <span style={{ color: "#000", opacity: "50%", fontSize: 32 }} className="material-icons-round">broken_image</span>
                )}
                {/* Settings-style button (top right) */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    padding: "1rem"
                }}>
                    <button
                        type="button"
                        onClick={() => inputRef.current.click()}
                        style={{
                            borderRadius: "100px",
                            height: 40,
                            width: 40,
                            background: "rgba(0,0,0,0.53)",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                            cursor: "pointer"
                        }}
                        className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
                    >
                        <span className="material-icons-round" style={{ color: "#fff", fontSize: 24 }}>add_a_photo</span>
                    </button>
                    {/* Red X button (bottom right, only if image) */}
                    {preview && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={{
                                borderRadius: "100px",
                                height: 40,
                                width: 40,
                                background: "#ff3b3b",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                                cursor: "pointer"
                            }}
                            className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
                        >
                            <span className="material-icons-round" style={{ color: "#fff", fontSize: 24 }}>close</span>
                        </button>
                    )}
                </div>

            </picture>
        </div>
    );
}