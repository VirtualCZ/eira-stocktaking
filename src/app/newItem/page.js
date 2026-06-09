"use client";

import NewItemForm from "@/components/organisms/NewItemForm";
import PageLoadingScreen from "@/components/atoms/PageLoadingScreen";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { buildStocktakingListUrl, HOME_PATH } from "@/utils/inventoryNavigation";

/** Main menu: add new asset → Nezkontrolováno */
export default function NewItemPage() {
  const { selectedInventura, ready } = useSelectedInventura();

  if (!ready) {
    return <PageLoadingScreen />;
  }

  const stocktakingId = selectedInventura?.id;
  if (!stocktakingId) {
    return (
      <main className="relative min-h-screen flex flex-col items-center p-4">
        <p style={{ color: "#FF6262", fontWeight: 600 }}>
          Nejdřív vyberte inventuru v seznamu inventur.
        </p>
      </main>
    );
  }

  const defaultReturnTo = buildStocktakingListUrl(stocktakingId, {
    returnTo: HOME_PATH,
  });

  return (
    <NewItemForm
      stocktakingId={stocktakingId}
      defaultReturnTo={defaultReturnTo}
    />
  );
}
