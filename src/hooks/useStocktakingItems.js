import { useState, useEffect, useCallback } from "react";
import { getAuthHeadersSafe, isAuthenticated } from "@/utils/token";

export function useStocktakingItems({ offset = 0, limit = 10, sortBy = 'id', sortOrder = 'asc', search = '', state, hasNote, roomId, eventId } = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(() => {
    // Don't make API call if not authenticated
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const body = {
      offset,
      limit,
      sortBy,
      sortOrder,
    };
    if (search && search.trim()) {
      body.search = search.trim();
    }
    if (state && Array.isArray(state) && state.length > 0) {
      body.state = state;
    }
    if (hasNote && Array.isArray(hasNote) && hasNote.length > 0) {
      body.hasNote = hasNote;
    }
    if (roomId) {
      body.roomId = roomId;
    }
    if (eventId) {
      body.eventId = eventId;
    }
    console.log("Sending to API:", body);
    fetch(`/api/objects`, {
      method: 'POST',
      headers: getAuthHeadersSafe(),
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch stocktaking items - HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total || 0);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [offset, limit, sortBy, sortOrder, search, state, hasNote, roomId, eventId]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems();
    }, search ? 500 : 0); // 500ms delay for search, no delay for other changes

    return () => clearTimeout(timeoutId);
  }, [fetchItems, search]);

  return [items, total, loading, error, fetchItems];
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
    fetch(`/api/object/by-qr`, {
      method: 'POST',
      headers: getAuthHeadersSafe(),
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch item by QR - HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
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