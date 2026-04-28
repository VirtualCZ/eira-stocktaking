import { useState, useEffect } from "react";
import { getAuthHeadersSafe, isAuthenticated } from "@/utils/token";

export function useStocktakingLists({ page = 0, limit = 10, sortBy = "id", sortOrder = "asc" } = {}) {
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
    fetch(`/api/events`, {
      method: "POST",
      headers: getAuthHeadersSafe(),
      body: JSON.stringify({
        page,
        limit,
        sortBy,
        sortOrder,
      }),
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
  }, [page, limit, sortBy, sortOrder]);

  return [lists, total, loading, error];
} 