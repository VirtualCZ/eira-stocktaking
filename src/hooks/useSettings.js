import { useState, useEffect } from 'react';

const PAGE_SIZE_MIN = 5;
const PAGE_SIZE_MAX = 50;
const PAGE_SIZE_DEFAULT = 10;

function normalizePageSize(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return PAGE_SIZE_DEFAULT;
    return Math.max(PAGE_SIZE_MIN, Math.min(Math.trunc(parsed), PAGE_SIZE_MAX));
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
    const [recordStatus, setRecordStatus] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_recordStatus');
            return saved !== null ? JSON.parse(saved) : false;
        }
        return false;
    });
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_itemsPerPage');
            return normalizePageSize(saved !== null ? saved : PAGE_SIZE_DEFAULT);
        }
        return PAGE_SIZE_DEFAULT;
    });

    // Save settings to localStorage when changed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_recordStatus', JSON.stringify(recordStatus));
            window.dispatchEvent(new CustomEvent('settings-updated'));
        }
    }, [recordStatus]);

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

    return {
        recordStatus,
        setRecordStatus,
        imageDebugDelayEnabled,
        setImageDebugDelayEnabled,
        imageDebugDelayMs,
        setImageDebugDelayMs,
        itemsPerPage,
        setItemsPerPage: (next) => setItemsPerPage(normalizePageSize(next))
    };
}
