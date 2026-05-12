import React from "react";
import CenteredModal from "../molecules/CenteredModal";
import ButtonGroup from "../atoms/ButtonGroup";
import Button from "../atoms/Button";
import { useSettings } from "@/hooks/useSettings";
import { INVENTORY_DISPLAY_MODE } from "@/utils/inventoryStates";

const yesNoOptions = [
    { value: false, label: "Ne", icon: "close" },
    { value: true, label: "Ano", icon: "check" },
];

const inventoryModeOptions = [
    { value: INVENTORY_DISPLAY_MODE.FULL, label: "Úplný", icon: "view_list" },
    { value: INVENTORY_DISPLAY_MODE.WORKFLOW, label: "Pracovní", icon: "task_alt" },
];

export default function SettingsModal({ isOpen, onClose }) {
    const {
        inventoryDisplayMode,
        setInventoryDisplayMode,
        imageDebugDelayEnabled,
        setImageDebugDelayEnabled,
        imageDebugDelayMs,
        setImageDebugDelayMs,
        itemsPerPage,
        setItemsPerPage,
    } = useSettings();

    const handleSave = () => {
        onClose();
    };

    return (
        <CenteredModal isOpen={isOpen} onClose={onClose} title="Nastavení" width="90vw">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>Režim inventury</div>
                    <ButtonGroup
                        options={inventoryModeOptions}
                        value={inventoryDisplayMode}
                        onChange={setInventoryDisplayMode}
                        iconPosition="left"
                        orientation="horizontal"
                    />
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#666",
                            fontStyle: "italic",
                            lineHeight: "1.4",
                        }}
                    >
                        Úplný: vše včetně položek ve stavu Nezkontrolováno. Pracovní: tyto položky se v seznamu
                        nezobrazují a ve filtru stavu nejsou k dispozici.
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                        Počet položek na stránku:
                    </div>
                    <ButtonGroup
                        options={[
                            { value: 10, label: "10" },
                            { value: 20, label: "20" },
                            { value: 30, label: "30" },
                            { value: 50, label: "50" },
                        ]}
                        value={itemsPerPage}
                        onChange={setItemsPerPage}
                        iconPosition="left"
                        orientation="horizontal"
                    />
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#666",
                            fontStyle: "italic",
                            lineHeight: "1.4",
                        }}
                    >
                        Ovlivní stránkování seznamů (inventury, položky, vyhledávání majetku).
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                        Dev: Zpomalení načítání obrázků
                    </div>
                    <ButtonGroup
                        options={yesNoOptions}
                        value={imageDebugDelayEnabled}
                        onChange={setImageDebugDelayEnabled}
                        iconPosition="left"
                        orientation="horizontal"
                    />
                    {imageDebugDelayEnabled && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <input
                                type="range"
                                min={0}
                                max={3000}
                                step={100}
                                value={imageDebugDelayMs}
                                onChange={(e) => setImageDebugDelayMs(Number(e.target.value))}
                            />
                            <div style={{ fontSize: "12px", color: "#666" }}>
                                Zpoždění: {imageDebugDelayMs} ms
                            </div>
                        </div>
                    )}
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#666",
                            fontStyle: "italic",
                            lineHeight: "1.4",
                        }}
                    >
                        Používá se pro testování skeleton/no-image stavů.
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "flex-end",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #e0e0e0",
                        marginTop: "0.75rem",
                    }}
                >
                    <Button variant="secondary" icon="close" iconPosition="right" onClick={onClose}>
                        Zrušit
                    </Button>
                    <Button icon="check" iconPosition="right" onClick={handleSave}>
                        Uložit
                    </Button>
                </div>
            </div>
        </CenteredModal>
    );
}
