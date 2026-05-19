"use client";

import NewItemForm from "@/components/organisms/NewItemForm";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { buildStocktakingListUrl, HOME_PATH } from "@/utils/inventoryNavigation";

/** Main menu: add new asset → Nezkontrolováno */
export default function NewItemPage() {
  const { selectedInventura } = useSelectedInventura();

  if (!selectedInventura?.id) {
    return (
      <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "#FF6262", fontWeight: 600, fontSize: "1.2rem" }}>
          Nejprve vyberte inventuru na hlavní stránce.
        </div>
      </div>
    );
  }

  const defaultReturnTo = buildStocktakingListUrl(selectedInventura.id, {
    returnTo: HOME_PATH,
  });

  return (
    <NewItemForm
      stocktakingId={selectedInventura.id}
      defaultReturnTo={defaultReturnTo}
    />
  );
}
