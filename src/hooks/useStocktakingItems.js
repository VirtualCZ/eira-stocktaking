import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

const objectsResponseCache = new Map();
const objectsInFlight = new Map();
const OBJECTS_CACHE_TTL_MS = 4000;
const objectImagesCache = new Map();
const objectImagesInFlight = new Map();

function buildObjectsRequestBody(params, forceIncludeImages = null) {
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
        includeImages = false
    } = params;

    const body = {
        offset,
        limit,
        sortBy,
        sortOrder,
        search,
        state,
        hasNote,
        includeImages: forceIncludeImages ?? includeImages,
        thumbnail: true
    };

    if (roomId) {
        body.roomId = roomId;
    }
    if (buildingId) {
        body.buildingId = buildingId;
    }
    if (storeyId) {
        body.storeyId = storeyId;
    }
    if (noLocation) {
        body.noLocation = noLocation;
    }
    if (eventId) {
        body.eventId = parseInt(eventId, 10);
    }
    if (entregIds && entregIds.length > 0) {
        body.entregIds = entregIds;
    }

    return body;
}

export function useStocktakingItems(options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasImagesForCurrentPage, setHasImagesForCurrentPage] = useState(false);
    const [imagesResolvedForCurrentPage, setImagesResolvedForCurrentPage] = useState(false);

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

    const fetchObjects = useCallback(async (forceIncludeImages = null) => {
        if (skip || !isAuthenticated()) {
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        let abortController = null;

        try {
            const body = buildObjectsRequestBody({
                offset,
                limit,
                sortBy,
                sortOrder,
                search,
                state,
                hasNote,
                roomId,
                buildingId,
                storeyId,
                noLocation,
                eventId,
                entregIds,
                includeImages
            }, forceIncludeImages);
            const requestKey = JSON.stringify(body);
            const cached = objectsResponseCache.get(requestKey);
            const now = Date.now();
            if (cached && now - cached.ts < OBJECTS_CACHE_TTL_MS) {
                setItems(cached.data.items || []);
                setTotal(cached.data.total || 0);
                const hasImages = cached.data.items && cached.data.items.length > 0 && cached.data.items.some(item => item.image);
                setHasImagesForCurrentPage(hasImages);
                setImagesResolvedForCurrentPage(false);
                return null;
            }

            if (objectsInFlight.has(requestKey)) {
                const sharedData = await objectsInFlight.get(requestKey);
                setItems(sharedData.items || []);
                setTotal(sharedData.total || 0);
                const hasImages = sharedData.items && sharedData.items.length > 0 && sharedData.items.some(item => item.image);
                setHasImagesForCurrentPage(hasImages);
                setImagesResolvedForCurrentPage(false);
                return null;
            }

            abortController = new AbortController();

            const requestPromise = fetch(`/api/objects`, {
                method: 'POST',
                headers: getAuthHeadersSafe(),
                body: JSON.stringify(body),
                signal: abortController.signal
            }).then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }
                return res.json();
            });

            objectsInFlight.set(requestKey, requestPromise);
            const data = await requestPromise;
            objectsResponseCache.set(requestKey, { ts: now, data });
            objectsInFlight.delete(requestKey);
            
            if (!abortController.signal.aborted) {
                setItems(data.items || []);
                setTotal(data.total || 0);
                // Track if we have images for the current page by checking actual item data
                const hasImages = data.items && data.items.length > 0 && data.items.some(item => item.image);
                setHasImagesForCurrentPage(hasImages);
                setImagesResolvedForCurrentPage(false);
            }

            return abortController;
        } catch (err) {
            // Ensure failed shared request is not kept in-flight.
            const body = buildObjectsRequestBody({
                offset,
                limit,
                sortBy,
                sortOrder,
                search,
                state,
                hasNote,
                roomId,
                buildingId,
                storeyId,
                noLocation,
                eventId,
                entregIds,
                includeImages
            }, forceIncludeImages);
            objectsInFlight.delete(JSON.stringify(body));
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
    }, [offset, limit, sortBy, sortOrder, search, state, hasNote, roomId, buildingId, storeyId, noLocation, eventId, includeImages, skip]);

    const refetchItems = useCallback(async () => {
        const result = await fetchObjects();
        return result;
    }, [fetchObjects]);

    const fetchImagesForItems = useCallback(async () => {
        // Do not mark images "resolved" with an empty list — list fetch may still be in flight.
        if (!items || items.length === 0) {
            return null;
        }
        const ids = items.map(item => item.id).filter(Boolean);
        const requestKey = ids.slice().sort((a, b) => a - b).join(",");
        const cached = objectImagesCache.get(requestKey);
        if (cached) {
            setItems(prev =>
                prev.map(item => ({ ...item, image: cached[item.id] || null }))
            );
            setHasImagesForCurrentPage(Object.keys(cached).length > 0);
            setImagesResolvedForCurrentPage(true);
            return null;
        }
        if (objectImagesInFlight.has(requestKey)) {
            const shared = await objectImagesInFlight.get(requestKey);
            setItems(prev =>
                prev.map(item => ({ ...item, image: shared[item.id] || null }))
            );
            setHasImagesForCurrentPage(Object.keys(shared).length > 0);
            setImagesResolvedForCurrentPage(true);
            return null;
        }
        const requestPromise = fetch('/api/objects/images', {
            method: 'POST',
            headers: getAuthHeadersSafe(),
            body: JSON.stringify({ ids })
        }).then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }
            return res.json();
        });
        objectImagesInFlight.set(requestKey, requestPromise);
        try {
            const imageMap = await requestPromise;
            objectImagesCache.set(requestKey, imageMap || {});
            setItems(prev =>
                prev.map(item => ({ ...item, image: imageMap?.[item.id] || null }))
            );
            setHasImagesForCurrentPage(Boolean(imageMap && Object.keys(imageMap).length > 0));
            setImagesResolvedForCurrentPage(true);
            return null;
        } finally {
            objectImagesInFlight.delete(requestKey);
        }
    }, [items]);

    // Smart refetch that fetches images via specialized endpoint
    const refetchWithImages = useCallback(async () => {
        if (!imagesResolvedForCurrentPage) {
            return fetchImagesForItems();
        }
        // We already resolved image payload state for current page.
        return null;
    }, [fetchImagesForItems, imagesResolvedForCurrentPage]);

    // Debounced search effect with request cancellation
    useEffect(() => {
        let timeoutId;
        let abortController;
        
        timeoutId = setTimeout(async () => {
            const result = await fetchObjects();
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
    }, [fetchObjects, search]);

    return [items, total, loading, error, refetchItems, refetchWithImages, hasImagesForCurrentPage, imagesResolvedForCurrentPage];
}

export function useStocktakingItem(id, eventId) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItem = useCallback(() => {
    if (!id) return;
    
    // Don't make API call if not authenticated
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const body = { id };
    if (eventId) {
      body.eventId = eventId;
    }

    fetch(`/api/object`, {
      method: 'POST',
      headers: getAuthHeadersSafe(),
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch stocktaking item - HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id, eventId]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return [item, loading, error, fetchItem];
}

export function useStocktakingItemByQr(qr, eventId) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedQr, setResolvedQr] = useState(null);

  useEffect(() => {
    if (!qr) {
      setLoading(false);
      setResolvedQr(null);
      return;
    }
    const normalizedQr = String(qr).trim();
    if (!normalizedQr) {
      setLoading(false);
      setResolvedQr(null);
      return;
    }
    
    setItem(null);
    setLoading(true);
    setError(null);
    setResolvedQr(null);
    
    const body = { qr: normalizedQr };
    if (eventId) {
      body.eventId = eventId;
    }
    
    // Create AbortController for this request
    const abortController = new AbortController();
    
    fetch(`/api/object/by-qr`, {
      method: 'POST',
      headers: getAuthHeadersSafe(),
      body: JSON.stringify(body),
      signal: abortController.signal
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch item by QR - HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        // Only update state if this request hasn't been aborted
        if (!abortController.signal.aborted) {
          setItem(data);
          setError(null);
          setResolvedQr(normalizedQr);
        }
      })
      .catch((err) => {
        // Only update error if this request hasn't been aborted
        if (!abortController.signal.aborted) {
          setItem(null);
          setError(err);
          setResolvedQr(normalizedQr);
        }
      })
      .finally(() => {
        // Only update loading if this request hasn't been aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });
      
    // Return cleanup function to abort the request
    return () => {
      abortController.abort();
      setLoading(false);
    };
  }, [qr, eventId]);

  return [item, loading, error, resolvedQr];
}

export function useCreateStocktakingItem(eventId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const createItem = async (item) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const itemWithEventId = { ...item };
      if (eventId) {
        itemWithEventId.eventId = eventId;
      }
      const res = await fetch('/api/objects/create', {
        method: 'POST',
        headers: getAuthHeadersSafe(),
        body: JSON.stringify(itemWithEventId),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create item - HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      setSuccess(true);
      return await res.json();
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createItem, loading, error, success };
}

export function useUpdateStocktakingItem(eventId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateItem = async (item) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const itemWithEventId = { ...item };
      if (eventId) {
        itemWithEventId.eventId = eventId;
      }
      const res = await fetch('/api/objects/update', {
        method: 'POST',
        headers: getAuthHeadersSafe(),
        body: JSON.stringify(itemWithEventId),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update item - HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      setSuccess(true);
      return await res.json();
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateItem, loading, error, success };
}

export function useDeleteStocktakingItem(eventId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteItem = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const body = { id };
      if (eventId) {
        body.eventId = eventId;
      }
      const res = await fetch('/api/objects/delete', {
        method: 'POST',
        headers: getAuthHeadersSafe(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete item - HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      setSuccess(true);
      const text = await res.text();
      return text;
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteItem, loading, error, success };
}

export function useDuplicateStocktakingItem(eventId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const duplicateItem = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const body = { id };
      if (eventId) {
        body.eventId = eventId;
      }
      const res = await fetch('/api/objects/duplicate', {
        method: 'POST',
        headers: getAuthHeadersSafe(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to duplicate item - HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      setSuccess(true);
      const text = await res.text();
      return text;
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { duplicateItem, loading, error, success };
} 