"use client"
import React from "react";
import { useGetLocation, useSetLocation } from "@/hooks/useLocation";
import LocationPicker from "@/components/organisms/LocationPicker";

export default function UserLocationPicker({ editMode = true }) {
  const getLocation = useGetLocation();
  const setLocation = useSetLocation();

  return (
    <LocationPicker
      getter={getLocation}
      setter={setLocation}
      editMode={editMode}
    />
  );
} 