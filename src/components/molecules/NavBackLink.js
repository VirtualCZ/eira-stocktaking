import Link from "next/link";
import { backIconForReturnTo } from "@/utils/inventoryNavigation";

const linkStyle = {
  position: "absolute",
  marginTop: "1rem",
  marginLeft: "1rem",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 16,
  width: 38,
  height: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  textDecoration: "none",
};

export default function NavBackLink({ returnTo, title = "Zpět" }) {
  return (
    <Link href={returnTo} style={linkStyle} aria-label={title} title={title}>
      <span className="material-icons-round" style={{ fontSize: 16 }}>
        {backIconForReturnTo(returnTo)}
      </span>
    </Link>
  );
}
