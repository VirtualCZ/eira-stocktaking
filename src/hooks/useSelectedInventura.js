import { useState, useEffect } from 'react';

export function useSelectedInventura() {
    const [selectedInventura, setSelectedInventura] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('selectedInventura');
        if (saved) {
            try {
                setSelectedInventura(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse selected inventura:', e);
            }
        }
        setReady(true);
    }, []);

    const selectInventura = (inventura) => {
        setSelectedInventura(inventura);
        localStorage.setItem('selectedInventura', JSON.stringify(inventura));
    };

    const clearSelectedInventura = () => {
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