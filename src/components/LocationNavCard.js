"use client"
import Link from "next/link";
import Card from "./Card";
import { useGetLocation } from "@/hooks/useLocation";

export default function LocationNavCard() {
  const getLocation = useGetLocation();
  const location = getLocation();
  const budova = location?.budova || "-";
  const podlazi = location?.podlazi || "-";
  const mistnost = location?.mistnost || "-";

  return (
    <Card
      style={{ padding: 0, gap: 0 }}
    >
      <div style={{ display: "flex", alignItems: "stretch", width: "100%", minHeight: 96 }}>
        {/* Left: Location info */}
        <div
          style={{
            padding: "1rem",
            paddingRight: 0,
            display: "flex",
            alignItems: "center"
          }}>
          <span
            className="material-icons-round"
            style={{
              fontSize: "2rem",
              color: "#b640ff",
              borderRadius: "1rem",
            }}
          >
            location_on
          </span>
        </div>
        <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <header
            style={{
              color: "#4E5058",
              fontWeight: 600,
              fontSize: "1rem",
              paddingBottom: "0.25rem"
            }}
          >
            Lokace
          </header>
          <div style={{lineHeight: "1.25rem"}}>Budova: {budova}</div>
          <div style={{lineHeight: "1.25rem"}}>Patro: {podlazi}</div>
          <div style={{lineHeight: "1.25rem"}}>Místnost: {mistnost}</div>
        </div>
        {/* Right: Edit strip */}
        <Link
          href="/locationChooser"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#b640ff",
            minHeight: "100%",
            borderTopRightRadius: "1rem",
            borderBottomRightRadius: "1rem",
            textDecoration: "none",
            padding: "1rem"
          }}
        >
          <span className="material-icons-round" style={{ fontSize: "2rem", color: "#fff" }}>
            edit
          </span>
        </Link>
      </div>
    </Card>
  );
}