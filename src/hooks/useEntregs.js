import { useState, useEffect } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

export function useEntregs() {
    const [entregs, setEntregs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEntregs = async () => {
            if (!isAuthenticated()) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/object-types', {
                    method: 'GET',
                    headers: getAuthHeadersSafe()
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }

                const data = await res.json();
                
                // Ensure we always set an array
                if (Array.isArray(data)) {
                    setEntregs(data);
                } else if (data && Array.isArray(data.data)) {
                    // Handle case where data is wrapped in a data property
                    setEntregs(data.data);
                } else if (data && Array.isArray(data.items)) {
                    // Handle case where data is wrapped in an items property
                    setEntregs(data.items);
                } else {
                    console.warn('Unexpected data format for entregs:', data);
                    setEntregs([]);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEntregs();
    }, []);

    return [entregs, loading, error];
}
