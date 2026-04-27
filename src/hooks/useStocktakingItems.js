import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

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