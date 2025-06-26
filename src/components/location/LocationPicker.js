"use client"
import React, { useState, useEffect } from "react";
import LocationModalTrigger from "./LocationModalTrigger";
import LocationPickerModal from "./LocationPickerModal";

export default function LocationPicker({ getter, setter, editMode = true }) {
  const [location, setLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update location on mount
  useEffect(() => {
    setLocation(getter());
    // eslint-disable-next-line
  }, [getter]);

  // Update location whenever modal closes (after possible change)
  useEffect(() => {
    if (!isModalOpen) {
      setLocation(getter());
    }
    // eslint-disable-next-line
  }, [isModalOpen, getter]);

  // Editable mode
  const handleSave = (newLoc) => {
    setter(newLoc);
    setIsModalOpen(false);
  };

  return (
    <>
      <LocationModalTrigger
        onClick={() => setIsModalOpen(true)}
        location={location}
        editMode={editMode}
      />
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialLocation={location}
      />
    </>
  );
} 