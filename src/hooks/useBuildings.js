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
    fetch("/api/create/buildings", {
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

export function useStories(buildingId) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    fetch(`/api/create/buildings/${buildingId}/stories`, {
      headers: {
        "Authorization": basicAuth
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stories");
        return res.json();
      })
      .then((data) => {
        setStories(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [buildingId]);

  return [stories, loading, error];
}

export function useRooms(buildingId, storyId) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!buildingId || !storyId) return;
    setLoading(true);
    fetch(`/api/create/buildings/${buildingId}/stories/${storyId}/rooms`, {
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
  }, [buildingId, storyId]);

  return [rooms, loading, error];
}