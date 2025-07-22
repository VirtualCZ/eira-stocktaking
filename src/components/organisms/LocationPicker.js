"use client"
import React, { useState } from "react";
import LocationModalTrigger from "@/components/molecules/LocationModalTrigger";
import LocationPickerModal from "@/components/organisms/LocationPickerModal";

export default function LocationPicker({ 
  value = null, 
  onChange, 
  editMode = true, 
  label = "Lokace:",
  onModalOpen,
  onModalClose
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Editable mode
  const handleSave = (newLoc) => {
    if (onChange) {
      onChange(newLoc);
    }
    setIsModalOpen(false);
  };

  const handleOpen = () => {
    setIsModalOpen(true);
    if (onModalOpen) onModalOpen();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (onModalClose) onModalClose();
  };

  return (
    <>
      <LocationModalTrigger
        onClick={handleOpen}
        location={value}
        editMode={editMode}
        label={label}
      />
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
        initialLocation={value}
      />
    </>
  );
} 