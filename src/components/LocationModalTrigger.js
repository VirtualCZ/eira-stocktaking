"use client"
import { useEffect, useState } from "react";
import { useGetLocation } from "@/hooks/useLocation";

export default function LocationModalTrigger({ onClick }) {
  const getLocation = useGetLocation();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    setLocation(getLocation());
  }, [getLocation]);

  const budova = location?.budova || "-";
  const podlazi = location?.podlazi || "-";
  const mistnost = location?.mistnost || "-";

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
        <span className="material-icons-round" style={{ fontSize: 14, color: "#000" }}>
          edit
        </span>
      </div>
    </button>
  );
} 