import React from "react";

export default function Checkbox({
    label,
    checked,
    onChange,
    value,
    name,
    style = {},
    checkboxStyle = {},
    onClick
}) {
    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                cursor: 'pointer',
                fontSize: '0.95em',
                width: '100%',
                ...style
            }}
        >
            <span>{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(value)}
                name={name}
                style={{ width: 16, height: 16, accentColor: '#282828', marginLeft: 8, ...checkboxStyle }}
                onClick={onClick}
            />
        </label>
    );
} 