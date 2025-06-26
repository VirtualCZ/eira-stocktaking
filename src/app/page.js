"use client"
import { NavLink } from "@/components/NavCard";
import HeadingCard from "@/components/HeadingCard";
import Link from "next/link";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import UserLocationPicker from "@/components/location/UserLocationPicker";

export default function Home() {
  const { selectedInventura } = useSelectedInventura();
  
  // Czech day names
  const days = [
    "neděle",
    "pondělí",
    "úterý",
    "středa",
    "čtvrtek",
    "pátek",
    "sobota"
  ];
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;
  const dayName = days[today.getDay()];

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: "#ffffff",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {/* Button Row */}
      <div
        className="flex justify-between container"
      >
        {/* Left: Uživateľ, Log out */}
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{ backgroundColor: "#000" }}
          >
            <span className="material-icons-round" style={{ fontSize: 14, color: "#fff" }}>account_circle</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Uživatel</span>
          </button>
          <button
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{ backgroundColor: "#ff0000" }}
          >
            <span className="material-icons-round" style={{ fontSize: 14, color: "#fff" }}>logout</span>
          </button>
        </div>
        {/* Right: Settings */}
        <div className="flex items-center">
          <Link
            href="/settings"
            className="flex items-center justify-center p-3 rounded-2xl"
            style={{ backgroundColor: "#000" }}
          >
            <span className="material-icons-round" style={{ fontSize: 14, color: "#fff" }}>settings</span>
          </Link>
        </div>
      </div>

      {/* ; Content */}
      <main
        className="flex flex-col gap-4 container"
      >

        <HeadingCard
          heading="Dobrý den,"
          // actions={[{ icon: "home", onClick: () => alert("Home") }]}
          extraRow={`dnes je ${dayName} ${formattedDate}`} // Only for first page
        />
  <UserLocationPicker/>
        <nav className="flex flex-col gap-2">
          <NavLink
            text="Seznam inventur"
            size="small"
            icon="inventory"
            href="stocktakingList"
            variant="light"
          />
          <div className="flex flex-row gap-2">
            <NavLink
              text={selectedInventura ? (selectedInventura.name || `Inventura #${selectedInventura.id}`) : "Vyberte inventuru"}
              size="big"
              icon="assignment"
              href={selectedInventura ? `stocktakingList/${selectedInventura.id}?returnTo=/` : "stocktakingList"}
              variant="dark"
            />
            <NavLink
              text="Najdi majetek"
              size="big"
              icon="search"
              href="search"
            />
          </div>
          <NavLink
            text="Přidat nový předmět"
            href="newItem"
          />
          <NavLink
            text="Seznam poloažek"
            href="itemList"
          />
        </nav>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
