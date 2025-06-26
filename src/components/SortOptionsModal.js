import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import Card from "./Card";
import RadioButton from "./inputs/RadioButton";

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
        <Modal title="Možnosti zobrazení" isOpen={isOpen} onClose={onClose} height="auto">
            <div style={{ margin: '0 auto', display: "flex", gap: "1rem", flexDirection: "column" }}>
                <Card style={{ padding: "1rem", gap: "0.5rem" }}>
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
                </Card>
                <Card style={{ padding: "1rem", gap: "0.5rem" }}>
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
                </Card>
            </div>
        </Modal>
    );
} 