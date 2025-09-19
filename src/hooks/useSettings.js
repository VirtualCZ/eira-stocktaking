import { useState, useEffect } from 'react';

export function useSettings() {
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
        }
    }, [recordStatus]);

    return {
        recordStatus,
        setRecordStatus
    };
}
