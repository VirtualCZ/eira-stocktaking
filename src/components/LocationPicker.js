import React, { useState } from "react";
import LocationModalTrigger from "./LocationModalTrigger";
import LocationPickerModal from "./LocationPickerModal";

export default function LocationPicker({ getter, setter, editMode = true, triggerLabel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = getter();

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