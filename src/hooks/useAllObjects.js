import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

export function useAllObjects(options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasImagesForCurrentPage, setHasImagesForCurrentPage] = useState(false);
    const hasInitialized = useRef(false);
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
            const body = {
                offset: currentOptions.offset,
                limit: currentOptions.limit,
                sortBy: currentOptions.sortBy,
                sortOrder: currentOptions.sortOrder,
                search: currentOptions.search,
                state: currentOptions.state,
                hasNote: currentOptions.hasNote,
                includeImages: currentOptions.includeImages,
                thumbnail: true // Always use thumbnails when including images
            };

            if (currentOptions.entregIds && currentOptions.entregIds.length > 0) {
                body.entregIds = currentOptions.entregIds;
            }

            if (currentOptions.roomId) {
                body.roomId = currentOptions.roomId;
            }
            if (currentOptions.buildingId) {
                body.buildingId = currentOptions.buildingId;
            }
            if (currentOptions.storeyId) {
                body.storeyId = currentOptions.storeyId;
            }
            if (currentOptions.noLocation) {
                body.noLocation = currentOptions.noLocation;
            }
            if (currentOptions.eventId) {
                body.eventId = parseInt(currentOptions.eventId, 10);
            }

            abortController = new AbortController();
            console.log("Sending to API:", body);

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
        const newOptions = { ...options, includeImages: true };
        const body = {
            offset: newOptions.offset || 0,
            limit: newOptions.limit || 10,
            sortBy: newOptions.sortBy || 'id',
            sortOrder: newOptions.sortOrder || 'asc',
            search: newOptions.search || '',
            state: newOptions.state || [],
            hasNote: newOptions.hasNote || [],
            includeImages: true,
            thumbnail: true
        };

        if (newOptions.roomId) {
            body.roomId = newOptions.roomId;
        }
        if (newOptions.eventId) {
            body.eventId = parseInt(newOptions.eventId, 10);
        }

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
