"use client";

import LinkItemForm from "@/components/organisms/LinkItemForm";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { buildStocktakingListUrl, HOME_PATH } from "@/utils/inventoryNavigation";

/** Main menu: propojit existující → Nezkontrolováno */
export default function LinkItemPage() {
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
    <LinkItemForm
      stocktakingId={selectedInventura.id}
      defaultReturnTo={defaultReturnTo}
    />
  );
}
