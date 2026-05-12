import React, { useState, useEffect, useRef } from "react";
import { useGetLocation, useSetLocation } from "@/hooks/useLocation";
import LocationPicker from "@/components/organisms/LocationPicker";

export default function UserLocationPicker({ editMode = true, onChange, onModalOpen, onModalClose }) {
  const getLocation = useGetLocation();
  const setLocationStorage = useSetLocation();
  const [location, setLocation] = useState(null);
  const onChangeRef = useRef(onChange);

  // Keep the ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // On mount, load from storage and notify parent
  useEffect(() => {
    const stored = getLocation();
    if (stored) {
      setLocation(stored);
      if (onChangeRef.current) onChangeRef.current(stored);
    }
  }, [getLocation]);

  const handleChange = (loc) => {
    setLocation(loc);
    setLocationStorage(loc);
    if (onChangeRef.current) onChangeRef.current(loc);
  };

  return (
    <LocationPicker
      value={location}
      onChange={handleChange}
      editMode={editMode}
      onModalOpen={onModalOpen}
      onModalClose={onModalClose}
    />
  );
} 