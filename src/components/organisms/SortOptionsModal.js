import React, { useState, useEffect, useRef } from "react";
import RadioButton from "@/components/atoms/RadioButton";
import CardContainer from "@/components/atoms/CardContainer";
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
        <CenteredModal title="Možnosti zobrazení" isOpen={isOpen} onClose={handleCancel} height="auto">
            <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                <CardContainer className="gap-2">
                    {sortOptions.map((opt) => (
                        <RadioButton
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                            checked={sortBy === opt.value}
                            onChange={setSortBy}
                            name="sortBy"
                        />
                    ))}
                </CardContainer>
                <CardContainer className="gap-2">
                    {orderOptions.map((opt) => (
                        <RadioButton
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                            checked={sortOrder === opt.value}
                            onChange={setSortOrder}
                            name="sortOrder"
                        />
                    ))}
                </CardContainer>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
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