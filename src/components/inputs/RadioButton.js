import React from "react";

export default function RadioButton({
    label,
    value,
    checked,
    onChange,
    name,
    style = {},
    radioStyle = {},
    onClick
}) {
    return (
        <button
            type="button"
            onClick={onClick || (() => onChange(value))}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                ...style
            }}
        >
            <span>{label}</span>
            <input
                type="radio"
                name={name}
                checked={checked}
                onChange={() => onChange(value)}
                onClick={e => e.stopPropagation()}
                style={{ accentColor: '#000', width: 14, height: 14, ...radioStyle }}
            />
        </button>
    );
} 