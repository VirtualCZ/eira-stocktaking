import { useState, useEffect } from "react";

const username = process.env.NEXT_PUBLIC_API_USERNAME;
const password = process.env.NEXT_PUBLIC_API_PASSWORD;
const basicAuth = "Basic " + (typeof window !== 'undefined' ? window.btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64'));

export function useBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/buildings", {
      headers: {
        "Authorization": basicAuth
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch buildings");
        return res.json();
      })
      .then((data) => {
        setBuildings(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return [buildings, loading, error];
}

export function useStoreys(buildingId) {
  const [storeys, setStoreys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    fetch(`/api/buildings/${buildingId}/storeys`, {
      headers: {
        "Authorization": basicAuth
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch storeys");
        return res.json();
      })
      .then((data) => {
        setStoreys(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [buildingId]);

  return [storeys, loading, error];
}

export function useRooms(buildingId, storeyId) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!buildingId || !storeyId) return;
    setLoading(true);
    fetch(`/api/buildings/${buildingId}/storeys/${storeyId}/rooms`, {
      headers: {
        "Authorization": basicAuth
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rooms");
        return res.json();
      })
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [buildingId, storeyId]);

  return [rooms, loading, error];
}