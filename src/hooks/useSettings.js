import { useState, useEffect } from 'react';
import { INVENTORY_DISPLAY_MODE } from '@/utils/inventoryStates';

const PAGE_SIZE_MIN = 5;
const PAGE_SIZE_MAX = 50;
const PAGE_SIZE_DEFAULT = 10;

function normalizePageSize(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return PAGE_SIZE_DEFAULT;
    return Math.max(PAGE_SIZE_MIN, Math.min(Math.trunc(parsed), PAGE_SIZE_MAX));
}

function readInventoryDisplayMode() {
    if (typeof window === 'undefined') return INVENTORY_DISPLAY_MODE.WORKFLOW;
    try {
        const v = localStorage.getItem('settings_inventoryDisplayMode');
        if (v === INVENTORY_DISPLAY_MODE.FULL || v === INVENTORY_DISPLAY_MODE.WORKFLOW) {
            return v;
        }
        const legacy = localStorage.getItem('settings_hideUncheckedInventoryItems');
        if (legacy !== null) {
            return JSON.parse(legacy) ? INVENTORY_DISPLAY_MODE.WORKFLOW : INVENTORY_DISPLAY_MODE.FULL;
        }
    } catch (_e) {
        /* ignore */
    }
    return INVENTORY_DISPLAY_MODE.WORKFLOW;
}

export function useSettings() {
    const [imageDebugDelayEnabled, setImageDebugDelayEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_imageDebugDelayEnabled');
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });
    const [imageDebugDelayMs, setImageDebugDelayMs] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_imageDebugDelayMs');
            const parsed = saved !== null ? Number(saved) : 700;
            return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, 5000)) : 700;
        }
        return 700;
    });
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_itemsPerPage');
            return normalizePageSize(saved !== null ? saved : PAGE_SIZE_DEFAULT);
        }
        return PAGE_SIZE_DEFAULT;
    });
    const [inventoryDisplayMode, setInventoryDisplayMode] = useState(readInventoryDisplayMode);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_imageDebugDelayEnabled', JSON.stringify(imageDebugDelayEnabled));
            window.dispatchEvent(new CustomEvent('settings-updated'));
        }
    }, [imageDebugDelayEnabled]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_imageDebugDelayMs', String(imageDebugDelayMs));
            window.dispatchEvent(new CustomEvent('settings-updated'));
        }
    }, [imageDebugDelayMs]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_itemsPerPage', String(normalizePageSize(itemsPerPage)));
            window.dispatchEvent(new CustomEvent('settings-updated'));
        }
    }, [itemsPerPage]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_inventoryDisplayMode', inventoryDisplayMode);
            try {
                localStorage.removeItem('settings_hideUncheckedInventoryItems');
            } catch (_e) {
                /* ignore */
            }
            try {
                localStorage.removeItem('settings_recordStatus');
            } catch (_e2) {
                /* ignore */
            }
            window.dispatchEvent(new CustomEvent('settings-updated'));
        }
    }, [inventoryDisplayMode]);

    return {
        imageDebugDelayEnabled,
        setImageDebugDelayEnabled,
        imageDebugDelayMs,
        setImageDebugDelayMs,
        itemsPerPage,
        setItemsPerPage: (next) => setItemsPerPage(normalizePageSize(next)),
        inventoryDisplayMode,
        setInventoryDisplayMode,
    };
}
