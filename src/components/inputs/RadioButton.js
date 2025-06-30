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
            aria-pressed={checked}
        >
            <span>{label}</span>
            <span
                style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#000',
                    position: 'relative',
                    marginLeft: 12,
                    ...radioStyle
                }}
                aria-hidden="true"
            >
                <span
                    style={{
                        display: 'block',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: checked ? 6 : 10,
                        height: checked ? 6 : 10,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'width 0.15s, height 0.15s',
                    }}
                />
            </span>
        </button>
    );
} 