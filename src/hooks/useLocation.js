import { useCallback } from "react";

export function useSetLocation() {
  return useCallback((location) => {
    localStorage.setItem("selectedLocation", JSON.stringify(location));
  }, []);
}

export function useGetLocation() {
  return useCallback(() => {
    const stored = localStorage.getItem("selectedLocation");
    return stored ? JSON.parse(stored) : null;
  }, []);
}