"use client"
import React from "react";
import { useBuildings, useStoreys, useRooms } from "@/hooks/useBuildings";

export default function LocationModalTrigger({ onClick, location, editMode = true, label = "Location:" }) {
  const [buildings] = useBuildings();
  const building = buildings.find(b => b.id === location?.building);
  const [storeys] = useStoreys(location?.building);
  const storey = storeys.find(s => s.id === location?.storey);
  const [rooms] = useRooms(location?.building, location?.storey);
  const room = rooms.find(r => r.id === location?.room);

  const buildingText = building?.text || location?.building || "-";
  const storeyText = storey?.text || location?.storey || "-";
  const roomText = room?.text || location?.room || "-";

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
            {buildingText}, {storeyText}, {roomText}
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