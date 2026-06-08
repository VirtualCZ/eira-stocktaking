"use client";

import LinkItemForm from "@/components/organisms/LinkItemForm";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import { buildStocktakingListUrl, HOME_PATH } from "@/utils/inventoryNavigation";

/** Main menu: propojit existující → Nezkontrolováno */
export default function LinkItemPage() {
  const { selectedInventura } = useSelectedInventura();

  const defaultReturnTo = buildStocktakingListUrl(selectedInventura?.id, {
    returnTo: HOME_PATH,
  });

  return (
    <LinkItemForm
      stocktakingId={selectedInventura.id}
      defaultReturnTo={defaultReturnTo}
    />
  );
}
