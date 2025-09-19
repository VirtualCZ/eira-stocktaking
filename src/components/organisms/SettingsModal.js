import React from "react";
import CenteredModal from "../molecules/CenteredModal";
import ButtonGroup from "../atoms/ButtonGroup";
import Button from "../atoms/Button";
import { useSettings } from "@/hooks/useSettings";

const recordStatusOptions = [
    { 
        value: false, 
        label: 'Ne', 
        icon: 'close'
    },
    { 
        value: true, 
        label: 'Ano', 
        icon: 'check'
    }
];

export default function SettingsModal({ isOpen, onClose }) {
    const { recordStatus, setRecordStatus } = useSettings();

    const handleSave = () => {
        onClose();
    };

    return (
        <CenteredModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Nastavení"
            width="90vw"
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                        Zaznamenat stav:
                    </div>
                    <ButtonGroup
                        options={recordStatusOptions}
                        value={recordStatus}
                        onChange={setRecordStatus}
                        iconPosition="left"
                        orientation="horizontal"
                    />
                    <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#666", 
                        fontStyle: "italic",
                        lineHeight: "1.4"
                    }}>
                        Po potvrzení nalezení se zobrazí okno s volbami stavu položky
                    </div>
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
                        onClick={onClose}
                    >
                        Zrušit
                    </Button>
                    <Button 
                        icon="check" 
                        iconPosition="right" 
                        onClick={handleSave}
                    >
                        Uložit
                    </Button>
                </div>
            </div>
        </CenteredModal>
    );
}
