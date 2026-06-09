import { useState, useEffect, useRef } from 'react';
import { clearAllInventuraEphemeralCaches } from '@/utils/inventuraCache';

function inventuraId(value) {
    if (value?.id == null) return null;
    const n = Number(value.id);
    return Number.isFinite(n) ? n : null;
}

export function useSelectedInventura() {
    const [selectedInventura, setSelectedInventura] = useState(null);
    const [ready, setReady] = useState(false);
    const activeInventuraIdRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('selectedInventura');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSelectedInventura(parsed);
                activeInventuraIdRef.current = inventuraId(parsed);
            } catch (e) {
                console.error('Failed to parse selected inventura:', e);
            }
        }
        setReady(true);
    }, []);

    const selectInventura = (inventura) => {
        const nextId = inventuraId(inventura);
        const prevId = activeInventuraIdRef.current;
        if (nextId != null && prevId !== nextId) {
            clearAllInventuraEphemeralCaches();
        }
        activeInventuraIdRef.current = nextId;
        setSelectedInventura(inventura);
        localStorage.setItem('selectedInventura', JSON.stringify(inventura));
    };

    const clearSelectedInventura = () => {
        clearAllInventuraEphemeralCaches();
        activeInventuraIdRef.current = null;
        setSelectedInventura(null);
        localStorage.removeItem('selectedInventura');
    };

    return {
        selectedInventura,
        selectInventura,
        clearSelectedInventura,
        ready,
    };
}
