"use client"
import React, { useState, useEffect } from "react";
import { useGetLocation, useSetLocation } from "@/hooks/useLocation";
import LocationPicker from "@/components/organisms/LocationPicker";

export default function UserLocationPicker({ editMode = true }) {
  const getLocation = useGetLocation();
  const setLocationStorage = useSetLocation();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    setLocation(getLocation());
    // Optionally, listen to storage events for cross-tab sync
    const onStorage = (e) => {
      if (e.key === "selectedLocation") {
        setLocation(getLocation());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [getLocation]);

  const handleChange = (loc) => {
    setLocation(loc);
    setLocationStorage(loc);
  };

  return (
    <LocationPicker
      value={location}
      onChange={handleChange}
      editMode={editMode}
    />
  );
} 