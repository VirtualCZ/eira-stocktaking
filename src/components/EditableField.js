import React, { useRef, useLayoutEffect, useState } from "react";

export default function EditableField({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    inputStyle = {},
    labelStyle = {},
    multiline = false,
    ...props
}) {
    const labelRef = useRef(null);
    const [labelDims, setLabelDims] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (labelRef.current) {
            setLabelDims({
                width: labelRef.current.offsetWidth,
                height: labelRef.current.offsetHeight
            });
        }
    }, [label, value]);

    return (
        <div style={{ width: "100%", position: "relative", marginTop: 8 }}>
            {label && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: 12,
                            top: -0,
                            width: labelDims.width,
                            height: "2px",
                            background: "#fff",
                            zIndex: 1,
                            pointerEvents: "none",
                            transition: "width 0.1s"
                        }}
                    />
                    <label
                        ref={labelRef}
                        style={{
                            position: "absolute",
                            left: 12,
                            top: -9,
                            zIndex: 2,
                            fontWeight: 400,
                            fontSize: "0.75rem",
                            color: "#535353",
                            background: "transparent",
                            padding: "0 4px",
                            ...labelStyle
                        }}
                    >
                        {label}
                    </label>
                </>
            )}
            {multiline || type === "textarea" ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: 8,
                        border: "1px solid #000",
                        fontSize: "1rem",
                        outline: "none",
                        minHeight: 40,
                        resize: "vertical",
                        boxSizing: "border-box",
                        ...inputStyle
                    }}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        borderRadius: 8,
                        border: "1px solid #000",
                        fontSize: "1rem",
                        outline: "none",
                        boxSizing: "border-box",
                        ...inputStyle
                    }}
                    {...props}
                />
            )}
        </div>
    );
} 