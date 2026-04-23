"use client"
import { NavLink } from "@/components/molecules/NavCard";
import HeadingCard from "@/components/molecules/HeadingCard";
import Link from "next/link";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { clearAuthToken } from "@/utils/token";
import { useRouter } from "next/navigation";
import SettingsModal from "@/components/organisms/SettingsModal";
import { useEffect, useState } from "react";

export default function Home() {
  const { selectedInventura } = useSelectedInventura();
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);



  const handleLogout = () => {
    clearAuthToken();
    // Redirect to a simple error page or show error message
    alert('Token cleared. Please access the site with a valid token.');
  };

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
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
              {userLoading ? "Načítání..." : (user?.username || user?.name || "Uživatel")}
            </span>
          </button>
          <button
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{ backgroundColor: "#ff0000" }}
            onClick={handleLogout}
          >
            <span className="material-icons-round" style={{ fontSize: 14, color: "#fff" }}>logout</span>
          </button>
        </div>
        {/* Right: Settings */}
        <div className="flex items-center">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center justify-center p-3 rounded-2xl"
            style={{ backgroundColor: "#000" }}
          >
            <span className="material-icons-round" style={{ fontSize: 14, color: "#fff" }}>settings</span>
          </button>
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
        <nav className="flex flex-col gap-2">
          {/* Event display card - non-clickable */}
          <div
            style={{
              background: "#000",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "stretch",
              color: "#fff",
              minHeight: "auto"
            }}
          >
            {/* Event name row */}
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", minHeight: 32 }}>
              <span className="material-icons-round" style={{ fontSize: 32, color: "#fff" }}>assignment</span>
            </div>
            
                         {/* Event name and place links */}
             <div style={{ marginTop: 47 }}>
               <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.25, marginBottom: 10 }}>
                 {selectedInventura ? (selectedInventura.name || `Inventura #${selectedInventura.id}`) : "Vyberte inventuru"}
               </div>
               
               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                 <NavLink
                   text="Změnit inventuru"
                   href="stocktakingList"
                   size="small"
                   variant="dark"
                 />
                 
                 {selectedInventura && (
                   <NavLink
                     text="Začít inventuru"
                     href={`stocktakingList/${selectedInventura.id}`}
                     size="small"
                     variant="dark"
                   />
                 )}
               </div>
             </div>
          </div>

                    {/* Divider */}
          <div style={{ width: '100%', height: 2, background: '#F0F1F3', margin: '8px 0' }} />
          
                     {/* Operations section */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
             <div style={{ fontWeight: 700, fontSize: 14, color: '#535353' }}>
               Operace s majetkem
             </div>

             <NavLink
               text="Najdi majetek"
               size="small"
               icon="search"
               href="search"
               disabled={!selectedInventura}
             />

             <NavLink
               text="Přidat nový předmět"
               size="small"
               href="newItem"
               disabled={!selectedInventura}
             />

             <NavLink
               text="Propojit existující položku"
               size="small"
               href="linkItem"
               disabled={!selectedInventura}
             />
           </div>
        </nav>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
      
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
}
