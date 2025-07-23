import { useState, useEffect } from "react";
import { getAuthHeadersSafe, isAuthenticated } from "@/utils/token";

export function useStocktakingLists({ offset = 0, limit = 10 } = {}) {
  const [lists, setLists] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't make API call if not authenticated
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString()
    });

    fetch(`/api/events?${params}`, {
      headers: getAuthHeadersSafe()
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