"use client"
import React from "react";
import { useBuildings, useStories, useRooms } from "@/hooks/useBuildings";

export default function LocationModalTrigger({ onClick, location, editMode = true, label = "Lokace:" }) {
  const [buildings] = useBuildings();
  const building = buildings.find(b => b.id === location?.budova);
  const [stories] = useStories(location?.budova);
  const story = stories.find(s => s.id === location?.podlazi);
  const [rooms] = useRooms(location?.budova, location?.podlazi);
  const room = rooms.find(r => r.id === location?.mistnost);

  const budovaText = building?.text || location?.budova || "-";
  const podlaziText = story?.text || location?.podlazi || "-";
  const mistnostText = room?.text || location?.mistnost || "-";

  const content = (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
        <div style={{ color: "#535353", fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
            location_on
          </span>
          <span style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
            {budovaText}, {podlaziText}, {mistnostText}
          </span>
        </div>
      </div>
      {editMode && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
          <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
            edit
          </span>
        </div>
      )}
    </>
  );

  if (editMode) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer"
        }}
      >
        {content}
      </button>
    );
  } else {
    return (
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {content}
      </div>
    );
  }
} 