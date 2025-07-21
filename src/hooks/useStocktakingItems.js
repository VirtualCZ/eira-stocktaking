import { useState, useEffect, useCallback } from "react";

const username = process.env.NEXT_PUBLIC_API_USERNAME;
const password = process.env.NEXT_PUBLIC_API_PASSWORD;
const basicAuth = "Basic " + (typeof window !== 'undefined' ? window.btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64'));

export function useStocktakingItems({ offset = 0, limit = 10, sortBy = 'id', sortOrder = 'asc', search = '', state, hasNote, roomId } = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
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
      console.log("Sending to API:", body);
      fetch(`/api/objects`, {
        method: 'POST',
        headers: {
          "Authorization": basicAuth,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch stocktaking items");
          return res.json();
        })
        .then((data) => {
          setItems(Array.isArray(data.items) ? data.items : []);
          setTotal(data.total || 0);
          setError(null);
        })
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }, search ? 500 : 0); // 500ms delay for search, no delay for other changes

    return () => clearTimeout(timeoutId);
  }, [offset, limit, sortBy, sortOrder, search, state, hasNote, roomId]);

  return [items, total, loading, error];
}

export function useStocktakingItem(id) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItem = useCallback(() => {
    if (!id) return;
    setLoading(true);
    const body = { id };

    fetch(`/api/object`, {
      method: 'POST',
      headers: {
        "Authorization": basicAuth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stocktaking item");
        return res.json();
      })
      .then((data) => {
        setItem(data);
        console.log('Fetched item from hook:', data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return [item, loading, error, fetchItem];
}

export function useCreateStocktakingItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const createItem = async (item) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/objects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
        },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('Failed to create item');
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

export function useUpdateStocktakingItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateItem = async (item) => {
    console.log(item)
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/objects/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
        },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('Failed to update item');
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

export function useDeleteStocktakingItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteItem = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/objects/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
        },
        body: JSON.stringify(id),
      });
      if (!res.ok) throw new Error('Failed to delete item');
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

export function useDuplicateStocktakingItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const duplicateItem = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/objects/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
        },
        body: JSON.stringify(id),
      });
      if (!res.ok) throw new Error('Failed to duplicate item');
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