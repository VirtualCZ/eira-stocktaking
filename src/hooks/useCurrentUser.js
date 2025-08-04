import { useState, useEffect } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/current', {
          method: 'GET',
          headers: getAuthHeadersSafe(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch current user - HTTP ${response.status}: ${errorText}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { user, loading, error };
} 