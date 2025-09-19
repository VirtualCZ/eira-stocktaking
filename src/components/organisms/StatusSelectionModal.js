import React, { useState } from "react";
import CenteredModal from "../molecules/CenteredModal";
import Button from "../atoms/Button";

const statusOptions = [
    { 
        value: 'v_poradku', 
        label: 'V pořádku', 
        icon: 'check_circle',
        color: '#282828'
    },
    { 
        value: 'poskozen_majetek', 
        label: 'Poškozen majetek', 
        icon: 'warning',
        color: '#666'
    },
    { 
        value: 'poskozeno_oznaceni', 
        label: 'Poškozeno označení', 
        icon: 'label_off',
        color: '#999'
    }
];

export default function StatusSelectionModal({ 
    isOpen, 
    onClose, 
    onStatusSelect, 
    itemName 
}) {
    const [selectedStatus, setSelectedStatus] = useState('v_poradku');

    const handleConfirm = () => {
        const status = statusOptions.find(opt => opt.value === selectedStatus);
        onStatusSelect(status);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <CenteredModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Stav položky"
            width="90vw"
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                    Vyberte stav pro položku: <strong style={{ color: "#282828" }}>{itemName}</strong>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedStatus(option.value)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem",
                                border: selectedStatus === option.value ? "2px solid #282828" : "1px solid #d1d1d1",
                                borderRadius: "8px",
                                background: selectedStatus === option.value ? "#f8f9fa" : "white",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                textAlign: "left",
                                width: "100%",
                                transition: "all 0.2s ease",
                                color: "#282828"
                            }}
                            onMouseEnter={(e) => {
                                if (selectedStatus !== option.value) {
                                    e.target.style.backgroundColor = "#f5f5f5";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedStatus !== option.value) {
                                    e.target.style.backgroundColor = "white";
                                }
                            }}
                        >
                            <span 
                                className="material-icons-round" 
                                style={{ 
                                    fontSize: 20, 
                                    color: option.color 
                                }}
                            >
                                {option.icon}
                            </span>
                            <span style={{ fontWeight: selectedStatus === option.value ? 600 : 500 }}>
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
                
                <div style={{ 
                    display: "flex", 
                    gap: "0.5rem", 
                    justifyContent: "flex-end", 
                    paddingTop: "0.75rem", 
                    borderTop: "1px solid #e0e0e0", 
                    marginTop: "0.75rem"
                }}>
                    <Button 
                        variant="secondary" 
                        icon="close" 
                        iconPosition="right" 
                        onClick={handleCancel}
                    >
                        Zrušit
                    </Button>
                    <Button 
                        icon="check" 
                        iconPosition="right" 
                        onClick={handleConfirm}
                    >
                        Potvrdit
                    </Button>
                </div>
            </div>
        </CenteredModal>
    );
}
