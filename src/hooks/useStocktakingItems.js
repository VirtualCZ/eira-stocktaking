import { useState, useEffect } from "react";

const username = process.env.NEXT_PUBLIC_API_USERNAME;
const password = process.env.NEXT_PUBLIC_API_PASSWORD;
const basicAuth = "Basic " + (typeof window !== 'undefined' ? window.btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64'));

export function useStocktakingItems({ offset = 0, limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString()
    });

    fetch(`/api/create/stocktaking?${params}`, {
      headers: {
        "Authorization": basicAuth
      }
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
  }, [offset, limit]);

  return [items, total, loading, error];
}

export function useStocktakingItem(id) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    // Fetch a single item by calculating the offset
    const offset = Number(id) - 1;
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: "1"
    });

    fetch(`/api/create/stocktaking?${params}`, {
      headers: {
        "Authorization": basicAuth
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stocktaking item");
        return res.json();
      })
      .then((data) => {
        const fetchedItem = Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : null;
        setItem(fetchedItem);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return [item, loading, error];
} 