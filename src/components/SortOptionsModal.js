import React, { useState, useEffect, useRef } from "react";
import RadioButton from "./inputs/RadioButton";
import CardContainer from "./CardContainer";
import CenteredModal from "./CenteredModal";

export default function SortOptionsModal({
    isOpen,
    onClose,
    sortOptions = [],
    orderOptions = [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' }
    ],
    initialSortBy,
    initialSortOrder,
    onChange
}) {
    const [sortBy, setSortBy] = useState(initialSortBy || (sortOptions[0] && sortOptions[0].value));
    const [sortOrder, setSortOrder] = useState(initialSortOrder || (orderOptions[0] && orderOptions[0].value));
    const prevIsOpen = useRef(isOpen);

    useEffect(() => {
        if (onChange) {
            onChange({ sortBy, sortOrder });
        }
    }, [sortBy, sortOrder]);

    useEffect(() => {
        // Only reset when opening
        if (!prevIsOpen.current && isOpen) {
            setSortBy(initialSortBy || (sortOptions[0] && sortOptions[0].value));
            setSortOrder(initialSortOrder || (orderOptions[0] && orderOptions[0].value));
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, initialSortBy, initialSortOrder, sortOptions, orderOptions]);

    return (
        <CenteredModal title="Možnosti zobrazení" isOpen={isOpen} onClose={onClose} height="auto">
            <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                <CardContainer className="gap-2">
                    {sortOptions.map((opt, idx, arr) => (
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
                    {orderOptions.map((opt, idx, arr) => (
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
            </div>
        </CenteredModal>
    );
} 