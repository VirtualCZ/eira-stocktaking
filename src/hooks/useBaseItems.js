import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

async function fetchBaseItemByIdRequest(id) {
    const response = await fetch('/api/base-items/by-id', {
        method: 'POST',
        headers: {
            ...getAuthHeadersSafe(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch base item: ${response.status}`);
    }

    return response.json();
}

async function linkBaseItemToEventRequest(inventoryData) {
    const response = await fetch('/api/base-items/link-to-event', {
        method: 'POST',
        headers: {
            ...getAuthHeadersSafe(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
    });

    if (!response.ok) {
        throw new Error(`Failed to create inventory item: ${response.status}`);
    }

    return response.json();
}

export function useBaseItemDetails() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            return await fetchBaseItemByIdRequest(id);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { fetchById, loading, error };
}

export function useLinkBaseItemToEvent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const linkToEvent = useCallback(async (inventoryData) => {
        setLoading(true);
        setError(null);
        try {
            return await linkBaseItemToEventRequest(inventoryData);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { linkToEvent, loading, error };
}

export function useBaseItems(options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        page = 0,
        limit = 20,
        sortBy = 'name',
        sortOrder = 'asc',
        search = '',
        buildingId = null,
        storeyId = null,
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
                page,
                limit,
                sortBy,
                sortOrder,
                search,
                eventId
            };

            if (buildingId) {
                body.buildingId = buildingId;
            }
            if (storeyId) {
                body.storeyId = storeyId;
            }
            if (roomId) {
                body.roomId = roomId;
            }

            abortController = new AbortController();

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
    }, [page, limit, sortBy, sortOrder, search, buildingId, storeyId, roomId, eventId, skip]);

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

    return [items, total, loading, error, refetchItems];
}
