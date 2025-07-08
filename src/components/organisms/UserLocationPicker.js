import React, { useState, useEffect } from "react";
import { useGetLocation, useSetLocation } from "@/hooks/useLocation";
import LocationPicker from "@/components/organisms/LocationPicker";

export default function UserLocationPicker({ editMode = true, onChange }) {
  const getLocation = useGetLocation();
  const setLocationStorage = useSetLocation();
  const [location, setLocation] = useState(null);

  // On mount, load from storage and notify parent
  useEffect(() => {
    const stored = getLocation();
    if (stored) {
      setLocation(stored);
      if (onChange) onChange(stored);
    }
  }, [getLocation, onChange]);

  const handleChange = (loc) => {
    setLocation(loc);
    setLocationStorage(loc);
    if (onChange) onChange(loc);
  };

  return (
    <LocationPicker
      value={location}
      onChange={handleChange}
      editMode={editMode}
    />
  );
} 