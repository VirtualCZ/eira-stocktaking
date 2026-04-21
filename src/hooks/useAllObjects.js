import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

function buildAllObjectsRequestBody(options, forceIncludeImages = null) {
    const body = {
        offset: options.offset ?? 0,
        limit: options.limit ?? 10,
        sortBy: options.sortBy ?? 'id',
        sortOrder: options.sortOrder ?? 'asc',
        search: options.search ?? '',
        state: options.state ?? [],
        hasNote: options.hasNote ?? [],
        includeImages: forceIncludeImages ?? options.includeImages ?? false,
        thumbnail: true
    };

    if (options.entregIds && options.entregIds.length > 0) {
        body.entregIds = options.entregIds;
    }
    if (options.roomId) {
        body.roomId = options.roomId;
    }
    if (options.buildingId) {
        body.buildingId = options.buildingId;
    }
    if (options.storeyId) {
        body.storeyId = options.storeyId;
    }
    if (options.noLocation) {
        body.noLocation = options.noLocation;
    }
    if (options.eventId) {
        body.eventId = parseInt(options.eventId, 10);
    }

    return body;
}

export function useAllObjects(options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasImagesForCurrentPage, setHasImagesForCurrentPage] = useState(false);
    const currentOptionsRef = useRef(options);

    const {
        offset = 0,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'asc',
        search = '',
        state = [],
        hasNote = [],
        roomId = null,
        buildingId = null,
        storeyId = null,
        noLocation = false,
        eventId = null,
        entregIds = [],
        includeImages = false,
        skip = false
    } = options;

    const fetchItems = useCallback(async () => {
        const currentOptions = currentOptionsRef.current;
        
        if (currentOptions.skip || !isAuthenticated()) {
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        let abortController = null;

        try {
            const body = buildAllObjectsRequestBody(currentOptions);

            abortController = new AbortController();

            const res = await fetch(`/api/all-objects`, {
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
                // Track if we have images for the current page by checking actual item data
                const hasImages = data.items && data.items.length > 0 && data.items.some(item => item.image);
                setHasImagesForCurrentPage(hasImages);
            }

            return abortController;
        } catch (err) {
            if (err.name === 'AbortError') {
                return abortController; // Request was cancelled
            }
            if (!abortController?.signal.aborted) {
                setError(err);
            }
        } finally {
            if (!abortController?.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    // Update the ref when options change
    useEffect(() => {
        currentOptionsRef.current = options;
    }, [options]);

    // Create a stable key for the current request to prevent unnecessary refetches
    const requestKey = useMemo(() => {
        return JSON.stringify({
            offset: options.offset,
            limit: options.limit,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
            search: options.search,
            state: options.state,
            hasNote: options.hasNote,
            entregIds: options.entregIds,
            roomId: options.roomId,
            buildingId: options.buildingId,
            storeyId: options.storeyId,
            noLocation: options.noLocation,
            eventId: options.eventId,
            includeImages: options.includeImages,
            skip: options.skip
        });
    }, [
        options.offset,
        options.limit,
        options.sortBy,
        options.sortOrder,
        options.search,
        options.state,
        options.hasNote,
        options.entregIds,
        options.roomId,
        options.buildingId,
        options.storeyId,
        options.noLocation,
        options.eventId,
        options.includeImages,
        options.skip
    ]);

    const refetchItems = useCallback(async () => {
        return await fetchItems();
    }, [fetchItems]);

    const refetchWithImages = useCallback(async () => {
        const body = buildAllObjectsRequestBody(options, true);

        try {
            const res = await fetch(`/api/all-objects`, {
                method: 'POST',
                headers: getAuthHeadersSafe(),
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || 0);
            const hasImages = data.items && data.items.length > 0 && data.items.some(item => item.image);
            setHasImagesForCurrentPage(hasImages);
        } catch (err) {
            setError(err);
        }
    }, [options]);

    useEffect(() => {
        if (skip) return;
        
        const abortController = fetchItems();
        return () => {
            if (abortController) {
                abortController.then(controller => {
                    if (controller && !controller.signal.aborted) {
                        controller.abort();
                    }
                });
            }
        };
    }, [requestKey, skip, fetchItems]);

    return [items, total, loading, error, refetchItems, refetchWithImages, hasImagesForCurrentPage];
}
