import { useState, useEffect } from 'react';

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

    return {
        recordStatus,
        setRecordStatus,
        imageDebugDelayEnabled,
        setImageDebugDelayEnabled,
        imageDebugDelayMs,
        setImageDebugDelayMs
    };
}
