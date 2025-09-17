import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

export function useBuildings() {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBuildings = useCallback(async () => {
        if (!isAuthenticated()) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/buildings', {
                method: 'GET',
                headers: getAuthHeadersSafe(),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            setBuildings(data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuildings();
    }, [fetchBuildings]);

    return { buildings, loading, error, refetch: fetchBuildings };
}

export function useStoreys(buildingId) {
    const [storeys, setStoreys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStoreys = useCallback(async () => {
        if (!isAuthenticated() || !buildingId) {
            setStoreys([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/buildings/${buildingId}/storeys`, {
                method: 'GET',
                headers: getAuthHeadersSafe(),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            setStoreys(data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [buildingId]);

    useEffect(() => {
        fetchStoreys();
    }, [fetchStoreys]);

    return { storeys, loading, error, refetch: fetchStoreys };
}

export function useRooms(buildingId, storeyId) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRooms = useCallback(async () => {
        if (!isAuthenticated() || !buildingId || !storeyId) {
            setRooms([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/buildings/${buildingId}/storeys/${storeyId}/rooms`, {
                method: 'GET',
                headers: getAuthHeadersSafe(),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            setRooms(data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [buildingId, storeyId]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    return { rooms, loading, error, refetch: fetchRooms };
}