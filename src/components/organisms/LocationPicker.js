"use client"
import React, { useState } from "react";
import LocationModalTrigger from "@/components/molecules/LocationModalTrigger";
import LocationPickerModal from "@/components/organisms/LocationPickerModal";

export default function LocationPicker({ 
  value = null, 
  onChange, 
  editMode = true, 
  label = "Lokace:" 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Editable mode
  const handleSave = (newLoc) => {
    if (onChange) {
      onChange(newLoc);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <LocationModalTrigger
        onClick={() => setIsModalOpen(true)}
        location={value}
        editMode={editMode}
        label={label}
      />
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialLocation={value}
      />
    </>
  );
} 