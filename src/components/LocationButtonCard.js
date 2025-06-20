import React from "react";

export default function LocationButtonCard({ location = {}, onClick, editMode = true }) {
  const budova = location?.budova || "-";
  const podlazi = location?.podlazi || "-";
  const mistnost = location?.mistnost || "-";

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {/* Left: Location info */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
        <div style={{ color: "#535353", fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
          Lokace:
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
            location_on
          </span>
          <span style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
            Budova {budova}, Podlaží {podlazi}, Místnost {mistnost}
          </span>
        </div>
      </div>
      {/* Right: Edit icon as button */}
      {editMode && (
        <button
          type="button"
          onClick={onClick}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8, background: "none", border: "none", cursor: "pointer" }}
        >
          <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
            edit
          </span>
        </button>
      )}
    </div>
  );
} 