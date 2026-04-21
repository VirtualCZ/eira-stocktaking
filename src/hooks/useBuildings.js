import { useState, useEffect, useCallback } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';

let buildingsCache = null;
let buildingsInFlightPromise = null;
const storeysCache = new Map();
const storeysInFlight = new Map();
const roomsCache = new Map();
const roomsInFlight = new Map();

export function useBuildings() {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBuildings = useCallback(async () => {
        if (!isAuthenticated()) {
            setLoading(false);
            return;
        }

        // Fast path: serve shared in-memory cache.
        if (buildingsCache) {
            setBuildings(buildingsCache);
            setLoading(false);
            return;
        }

        // If another hook instance is already fetching, await it.
        if (buildingsInFlightPromise) {
            setLoading(true);
            setError(null);
            try {
                const sharedData = await buildingsInFlightPromise;
                setBuildings(sharedData || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        try {
            buildingsInFlightPromise = (async () => {
                const res = await fetch('/api/buildings', {
                    method: 'GET',
                    headers: getAuthHeadersSafe(),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }

                const data = await res.json();
                return data || [];
            })();

            const data = await buildingsInFlightPromise;
            buildingsCache = data || [];
            setBuildings(buildingsCache);
        } catch (err) {
            setError(err);
        } finally {
            buildingsInFlightPromise = null;
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

        const cacheKey = String(buildingId);
        if (storeysCache.has(cacheKey)) {
            setStoreys(storeysCache.get(cacheKey) || []);
            setLoading(false);
            return;
        }

        if (storeysInFlight.has(cacheKey)) {
            setLoading(true);
            setError(null);
            try {
                const sharedData = await storeysInFlight.get(cacheKey);
                setStoreys(sharedData || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const requestPromise = (async () => {
                const res = await fetch(`/api/buildings/${buildingId}/storeys`, {
                    method: 'GET',
                    headers: getAuthHeadersSafe(),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }

                const data = await res.json();
                return data || [];
            })();
            storeysInFlight.set(cacheKey, requestPromise);
            const data = await requestPromise;
            storeysInFlight.delete(cacheKey);
            storeysCache.set(cacheKey, data);
            setStoreys(data || []);
        } catch (err) {
            storeysInFlight.delete(cacheKey);
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

        const cacheKey = `${buildingId}:${storeyId}`;
        if (roomsCache.has(cacheKey)) {
            setRooms(roomsCache.get(cacheKey) || []);
            setLoading(false);
            return;
        }

        if (roomsInFlight.has(cacheKey)) {
            setLoading(true);
            setError(null);
            try {
                const sharedData = await roomsInFlight.get(cacheKey);
                setRooms(sharedData || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const requestPromise = (async () => {
                const res = await fetch(`/api/buildings/${buildingId}/storeys/${storeyId}/rooms`, {
                    method: 'GET',
                    headers: getAuthHeadersSafe(),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }

                const data = await res.json();
                return data || [];
            })();
            roomsInFlight.set(cacheKey, requestPromise);
            const data = await requestPromise;
            roomsInFlight.delete(cacheKey);
            roomsCache.set(cacheKey, data);
            setRooms(data || []);
        } catch (err) {
            roomsInFlight.delete(cacheKey);
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