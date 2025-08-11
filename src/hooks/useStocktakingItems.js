import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

export function useStocktakingItems(options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasImagesForCurrentPage, setHasImagesForCurrentPage] = useState(false);

    const {
        offset = 0,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'asc',
        search = '',
        state = [],
        hasNote = [],
        roomId = null,
        eventId = null,
        includeImages = false,
        skip = false
    } = options;

    const fetchItems = useCallback(async () => {
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
                state,
                hasNote,
                includeImages,
                thumbnail: true // Always use thumbnails when including images
            };

            if (roomId) {
                body.roomId = roomId;
            }
            if (eventId) {
                body.eventId = parseInt(eventId, 10);
            }

            abortController = new AbortController();
            console.log("Sending to API:", body);

            const res = await fetch(`/api/objects`, {
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
    }, [offset, limit, sortBy, sortOrder, search, state, hasNote, roomId, eventId, skip]); // Removed includeImages from dependencies

    const refetchItems = useCallback(async () => {
        const result = await fetchItems();
        return result;
    }, [fetchItems]);

    // Smart refetch that only fetches images if needed
    const refetchWithImages = useCallback(async () => {
        if (!hasImagesForCurrentPage) {
            // We don't have images for current page, so refetch with images
            // Create a custom fetch with includeImages: true
            if (skip || !isAuthenticated()) {
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
                    state,
                    hasNote,
                    includeImages: true, // Force images
                    thumbnail: true
                };

                if (roomId) {
                    body.roomId = roomId;
                }
                if (eventId) {
                    body.eventId = parseInt(eventId, 10);
                }

                abortController = new AbortController();
                console.log("Refetching with images:", body);

                const res = await fetch(`/api/objects`, {
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
                    setHasImagesForCurrentPage(true);
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
        }
        // We already have images, no need to refetch
        return null;
    }, [offset, limit, sortBy, sortOrder, search, state, hasNote, roomId, eventId, skip, hasImagesForCurrentPage]);

    // Debounced search effect with request cancellation
    useEffect(() => {
        let timeoutId;
        let abortController;
        
        timeoutId = setTimeout(async () => {
            const result = await fetchItems();
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
    }, [fetchItems, search]);

    return [items, total, loading, error, refetchItems, refetchWithImages, hasImagesForCurrentPage];
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

    console.log("Sending to API:", body);

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
        console.log('Fetched item from hook:', data);
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

  useEffect(() => {
    if (!qr) return;
    
    setLoading(true);
    setError(null);
    
    const body = { qr };
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
        }
      })
      .catch((err) => {
        // Only update error if this request hasn't been aborted
        if (!abortController.signal.aborted) {
          setError(err);
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
    };
  }, [qr, eventId]);

  return [item, loading, error];
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
    console.log("pawsome",item)
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const itemWithEventId = { ...item };
      console.log(eventId)
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