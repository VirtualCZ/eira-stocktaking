import { useState, useEffect } from 'react';

export function useSettings() {
    const [recordStatus, setRecordStatus] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_recordStatus');
            if (saved !== null) {
                setRecordStatus(JSON.parse(saved));
            }
        }
    }, []);

    // Save settings to localStorage when changed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_recordStatus', JSON.stringify(recordStatus));
        }
    }, [recordStatus]);

    return {
        recordStatus,
        setRecordStatus
    };
}
