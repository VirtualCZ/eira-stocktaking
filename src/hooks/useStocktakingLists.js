import { useState, useEffect } from "react";

const username = process.env.NEXT_PUBLIC_API_USERNAME;
const password = process.env.NEXT_PUBLIC_API_PASSWORD;
const basicAuth = "Basic " + (typeof window !== 'undefined' ? window.btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64'));

export function useStocktakingLists({ offset = 0, limit = 10 } = {}) {
  const [lists, setLists] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString()
    });

    fetch(`/api/create/stocktaking-lists?${params}`, {
      headers: {
        "Authorization": basicAuth
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stocktaking lists");
        return res.json();
      })
      .then((data) => {
        setLists(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total || 0);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [offset, limit]);

  return [lists, total, loading, error];
} 