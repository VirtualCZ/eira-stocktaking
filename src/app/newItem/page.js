"use client";

import NewItemForm from "@/components/organisms/NewItemForm";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { buildStocktakingListUrl, HOME_PATH } from "@/utils/inventoryNavigation";

/** Main menu: add new asset → Nezkontrolováno */
export default function NewItemPage() {
  const { selectedInventura } = useSelectedInventura();

  const defaultReturnTo = buildStocktakingListUrl(selectedInventura?.id, {
    returnTo: HOME_PATH,
  });

  return (
    <NewItemForm
      stocktakingId={selectedInventura.id}
      defaultReturnTo={defaultReturnTo}
    />
  );
}
