import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

export function useBaseItems(options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        offset = 0,
        limit = 20,
        sortBy = 'name',
        sortOrder = 'asc',
        search = '',
        roomId = null,
        eventId = null,
        skip = false
    } = options;

    const fetchBaseItems = useCallback(async () => {
        if (skip || !isAuthenticated()) {
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        let abortController = null;

        try {
            const body = {
                offset,
                limit,
                sortBy,
                sortOrder,
                search,
                roomId,
                eventId
            };

            abortController = new AbortController();
            console.log("useBaseItems - Sending request:", body);
            console.log("useBaseItems - skip:", skip, "isAuthenticated:", isAuthenticated());

            const res = await fetch(`/api/base-items`, {
                method: 'POST',
                headers: getAuthHeadersSafe(),
                body: JSON.stringify(body),
                signal: abortController.signal
            });

            if (abortController.signal.aborted) {
                return abortController;
            }

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            console.log("useBaseItems - Received response:", data);
            
            if (!abortController.signal.aborted) {
                setItems(data.items || []);
                setTotal(data.total || 0);
            }

            return abortController;
        } catch (err) {
            if (err.name === 'AbortError') {
                return abortController;
            }
            if (!abortController?.signal.aborted) {
                setError(err);
            }
        } finally {
            if (!abortController?.signal.aborted) {
                setLoading(false);
            }
        }
    }, [offset, limit, sortBy, sortOrder, search, roomId, eventId, skip]);

    const refetchItems = useCallback(async () => {
        const result = await fetchBaseItems();
        return result;
    }, [fetchBaseItems]);

    // Debounced search effect with request cancellation
    useEffect(() => {
        let timeoutId;
        let abortController;
        
        timeoutId = setTimeout(async () => {
            const result = await fetchBaseItems();
            if (result) {
                abortController = result;
            }
        }, search ? 500 : 0); // 500ms delay for search, no delay for other changes

        return () => {
            clearTimeout(timeoutId);
            // Abort the request if it's still pending
            if (abortController) {
                abortController.abort();
            }
        };
    }, [fetchBaseItems, search]);

    // Additional operations for individual base items
    const fetchBaseItemById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        console.log(id)
        try {
            const response = await fetch('/api/base-item-by-id', {
                method: 'POST',
                headers: {
                    ...getAuthHeadersSafe(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch base item: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createInventoryItem = useCallback(async (inventoryData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/base-item/create-inventory', {
                method: 'POST',
                headers: {
                    ...getAuthHeadersSafe(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inventoryData)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to create inventory item: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return [items, total, loading, error, refetchItems, fetchBaseItemById, createInventoryItem];
}
