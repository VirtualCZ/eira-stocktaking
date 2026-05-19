import { useState, useCallback } from "react";
import { useLookupInventoryObjectByQrAny } from "@/hooks/useStocktakingItems";
import { useLinkBaseItemToEvent } from "@/hooks/useBaseItems";
import { INVENTORY_STATES } from "@/utils/inventoryStates";

/**
 * QR found in master data but not on current inventura: lookup + link as Nový.
 */
export function useOutsideInventuraQrItem(stocktakingId) {
  const { lookupByQrAny, loading: isLookingUpOutsideInventura } =
    useLookupInventoryObjectByQrAny();
  const { linkToEvent, loading: isAddingOutsideItem } = useLinkBaseItemToEvent();
  const [outsideInventuraItem, setOutsideInventuraItem] = useState(null);

  const resetOutsideInventuraItem = useCallback(() => {
    setOutsideInventuraItem(null);
  }, []);

  const lookupOutsideInventura = useCallback(
    async (qrValue) => {
      setOutsideInventuraItem(null);
      const data = await lookupByQrAny(qrValue);
      setOutsideInventuraItem(data || null);
      return data;
    },
    [lookupByQrAny]
  );

  const addOutsideItemToInventura = useCallback(
    async (location = null) => {
      if (!outsideInventuraItem?.id || !stocktakingId) {
        return null;
      }
      const created = await linkToEvent({
        rmId: outsideInventuraItem.id,
        eventId: stocktakingId,
        status: INVENTORY_STATES.NEW,
        note: outsideInventuraItem.note || "",
        qr: outsideInventuraItem.qr || "",
        location,
      });
      setOutsideInventuraItem(null);
      return created;
    },
    [outsideInventuraItem, stocktakingId, linkToEvent]
  );

  return {
    outsideInventuraItem,
    setOutsideInventuraItem,
    resetOutsideInventuraItem,
    lookupOutsideInventura,
    addOutsideItemToInventura,
    isLookingUpOutsideInventura,
    isAddingOutsideItem,
  };
}
