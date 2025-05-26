import Link from "next/link";
import Card from "./Card";

export default function NavCard({ name, items }) {
  return (
    <Card
      name={name}
      nameStyle={{
        padding: "1rem",
        paddingBottom: 0,
      }}
      style={{
        padding: "0",
        gap: 0
      }}
    >
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, idx) => (
          <li key={idx}>
            <Link
              href={item.href || "#"}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                padding: "1rem",
                gap: "1rem",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "background 0.15s",
                borderRadius: "0.5rem",
                color: "#000"
              }}
              className="transition-opacity hover:opacity-50 active:opacity-50 focus:opacity-50"
            >
              <span className="material-icons-round" style={{ fontSize: "2rem", color: "#000" }}>
                {item.icon}
              </span>
              <span>{item.text}</span>
            </Link>
            {idx !== items.length - 1 && (
              <div
                style={{
                  borderBottom: "1px solid #F0F0F0",
                  marginLeft: "3.25rem",
                  marginRight: 0
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}