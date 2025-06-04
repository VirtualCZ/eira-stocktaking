import Card from "@/components/Card";
import LocationNavCard from "@/components/LocationNavCard";
import NavCard from "@/components/NavCard";
import Link from "next/link";


export default function Home() {
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
      className="relative min-h-screen flex flex-col items-center"
      style={{
        background: "#F2F3F5",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {/* Banner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "8rem",
          background: "#b640ff",
          zIndex: 0,
        }}
      />

      {/* Button Row */}
      <div
        className="flex justify-between w-full container"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Left: User Button */}
        <button
          className="flex items-center gap-1"
          style={{
            borderRadius: "100px",
            height: "fit-content",
            background: "rgba(0,0,0,0.53)",
            padding: "0.5rem",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#fff",
            border: "none",
          }}
        >
          <span className="material-icons-round" style={{ fontSize: "1rem" }}>
            account_circle
          </span>
          Uživatel
        </button>

        {/* Right: Sign Out and Settings */}
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1"
            style={{
              borderRadius: "100px",
              height: "fit-content",
              background: "rgba(255,0,4,0.53)",
              padding: "0.5rem",
              fontWeight: 600,
              fontSize: "0.75rem",
              color: "#fff",
              border: "none",
            }}
          >
            <span className="material-icons-round" style={{ fontSize: "1rem" }}>
              logout
            </span>
            Odhlásit
          </button>
          <Link
            href="/settings"
            style={{
              borderRadius: "100px",
              height: "fit-content",
              background: "rgba(0,0,0,0.53)",
              padding: "0.5rem",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="flex items-center justify-center"
          >
            <span className="material-icons-round" style={{ fontSize: "1rem", color: "#fff" }}>
              settings
            </span>
          </Link>
        </div>
      </div>

      {/* ; Content */}
      <main
        className="flex flex-col items-center container"
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "4.5rem",
          width: "100%",
        }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0.25rem",
            width: "100%",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontWeight: 600, fontSize: "1.5rem", color: "#000", margin: 0 }}>
            Dobrý den,
          </h2>
          <p style={{ fontWeight: 400, fontSize: "1rem", color: "#333", margin: 0 }}>
            dnes je {dayName} {formattedDate}
          </p>
        </header>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2.5rem",
            width: "100%",
          }}
        >
          <LocationNavCard />
          <NavCard
            name="Akce"
            items={[
              { icon: "qr_code_scanner", text: "Skenovat QR kód", href: "/scanQR" },
              { icon: "note_add", text: "Nový předmět", href: "/newItem" },
              { icon: "post_add", text: "Nová inventura", href: "/newStocktaking" },
            ]}
          />
          <NavCard
            items={[
              { icon: "assignment", text: "Seznam inventur", href: "/stocktakingList" },
            ]}
          />
          <NavCard
            name="Ostatní"
            items={[
              { icon: "map", text: "Mapa", href: "/map" },
            ]}
          />
        </nav>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
