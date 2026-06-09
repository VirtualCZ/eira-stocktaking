"use client";

import { NavLink } from "@/components/molecules/NavCard";
import HeadingCard from "@/components/molecules/HeadingCard";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { clearAuthToken } from "@/utils/token";
import SettingsModal from "@/components/organisms/SettingsModal";
import { useState } from "react";
import {
  buildNewItemUrl,
  buildLinkItemUrl,
  buildStocktakingListUrl,
  buildScanUrl,
  HOME_PATH,
} from "@/utils/inventoryNavigation";
import {
  CLOSED_INVENTURA_MESSAGE,
  isInventuraActive,
  isInventuraClosed,
} from "@/utils/inventuraEventStates";

export default function Home() {
  const { selectedInventura } = useSelectedInventura();
  const { user, loading: userLoading } = useCurrentUser();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const inventuraActive = isInventuraActive(selectedInventura);
  const closedInventuraSelected = isInventuraClosed(selectedInventura);

  const showClosedInventuraMessage = () => {
    alert(CLOSED_INVENTURA_MESSAGE);
  };

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

      {/* Content */}
      <main className="flex flex-col gap-4 container">
        <HeadingCard
          heading="Dobrý den,"
          extraRow={`dnes je ${dayName} ${formattedDate}`}
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
              minHeight: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", minHeight: 32 }}>
              <span className="material-icons-round" style={{ fontSize: 32, color: "#fff" }}>
                assignment
              </span>
            </div>

            <div style={{ marginTop: 47 }}>
              <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.25, marginBottom: 10 }}>
                {selectedInventura
                  ? selectedInventura.name || `Inventura #${selectedInventura.id}`
                  : "Vyberte inventuru"}
              </div>
              {closedInventuraSelected && (
                <div style={{ fontSize: 12, color: "#ffb4b4", marginBottom: 10, lineHeight: 1.4 }}>
                  {CLOSED_INVENTURA_MESSAGE}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <NavLink text="Změnit inventuru" href="stocktakingList" size="small" variant="dark" />

                {selectedInventura && (
                  <>
                    <NavLink
                      text="Začít inventuru"
                      href={buildStocktakingListUrl(selectedInventura.id, { returnTo: "/" })}
                      size="small"
                      variant="dark"
                      disabled={closedInventuraSelected}
                      onDisabledClick={showClosedInventuraMessage}
                    />
                    <NavLink
                      text="Skener (QR)"
                      href={buildScanUrl(selectedInventura.id, { returnTo: HOME_PATH })}
                      size="small"
                      variant="dark"
                      disabled={closedInventuraSelected}
                      onDisabledClick={showClosedInventuraMessage}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 2, background: "#F0F1F3", margin: "8px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#535353" }}>Operace s majetkem</div>

            <NavLink
              text="Najdi majetek"
              size="small"
              icon="search"
              href="base-items"
              disabled={!inventuraActive}
              onDisabledClick={closedInventuraSelected ? showClosedInventuraMessage : undefined}
            />

            <NavLink
              text="Přidat nový předmět"
              size="small"
              icon="add"
              href={buildNewItemUrl({ returnTo: HOME_PATH })}
              disabled={!inventuraActive}
              onDisabledClick={closedInventuraSelected ? showClosedInventuraMessage : undefined}
            />

            <NavLink
              text="Propojit existující položku"
              size="small"
              icon="link"
              href={buildLinkItemUrl({ returnTo: HOME_PATH })}
              disabled={!inventuraActive}
              onDisabledClick={closedInventuraSelected ? showClosedInventuraMessage : undefined}
            />
          </div>
        </nav>
      </main>
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
}
