import React, { useState, useEffect, useRef } from "react";
import ButtonGroup from "@/components/atoms/ButtonGroup";
import CenteredModal from "@/components/molecules/CenteredModal";

export default function SortOptionsModal({
    isOpen,
    onClose,
    sortOptions = [],
    orderOptions = [
        { label: 'Vzestupně', value: 'asc' },
        { label: 'Sestupně', value: 'desc' }
    ],
    initialSortBy,
    initialSortOrder,
    onChange
}) {
    const [sortBy, setSortBy] = useState(initialSortBy || (sortOptions[0] && sortOptions[0].value));
    const [sortOrder, setSortOrder] = useState(initialSortOrder || (orderOptions[0] && orderOptions[0].value));
    const prevIsOpen = useRef(isOpen);

    // Reset local state to initial values when opening
    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            setSortBy(initialSortBy || (sortOptions[0] && sortOptions[0].value));
            setSortOrder(initialSortOrder || (orderOptions[0] && orderOptions[0].value));
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, initialSortBy, initialSortOrder, sortOptions, orderOptions]);

    const handleOk = () => {
        if (onChange) {
            onChange({ sortBy, sortOrder });
        }
        onClose();
    };

    const handleCancel = () => {
        // Reset to initial values
        setSortBy(initialSortBy || (sortOptions[0] && sortOptions[0].value));
        setSortOrder(initialSortOrder || (orderOptions[0] && orderOptions[0].value));
        onClose();
    };

    return (
        <CenteredModal title="Možnosti zobrazení" isOpen={isOpen} onClose={handleCancel} height="auto" width="90vw">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                        Seřadit podle:
                    </div>
                    <ButtonGroup
                        options={sortOptions.map(opt => ({
                            value: opt.value,
                            label: opt.label,
                            icon: opt.value === 'id' ? 'tag' : 
                                  opt.value === 'name' ? 'label' : 
                                  opt.value === 'lastCheck' ? 'schedule' : 'note'
                        }))}
                        value={sortBy}
                        onChange={setSortBy}
                        iconPosition="left"
                        orientation="vertical"
                    />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                        Pořadí:
                    </div>
                    <ButtonGroup
                        options={orderOptions.map(opt => ({
                            value: opt.value,
                            label: opt.label,
                            icon: opt.value === 'asc' ? 'arrow_upward' : 'arrow_downward'
                        }))}
                        value={sortOrder}
                        onChange={setSortOrder}
                        iconPosition="left"
                        orientation="vertical"
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: "0.5rem" }}>
                    <button
                        onClick={handleOk}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#282828",
                            color: "#fff",
                            border: "none",
                            borderRadius: "1rem",
                            padding: "0.75rem",
                            fontSize: "0.75rem",
                            cursor: "pointer"
                        }}
                    >
                        OK
                        <span className="material-icons-round" style={{ fontSize: 20, marginLeft: 8 }}>check</span>
                    </button>
                </div>
            </div>
        </CenteredModal>
    );
} 