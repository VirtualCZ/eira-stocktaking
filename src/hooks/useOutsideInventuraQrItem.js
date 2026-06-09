import { useState, useCallback } from "react";
import { useLookupInventoryObjectByQrAny } from "@/hooks/useStocktakingItems";
import { useLinkBaseItemToEvent } from "@/hooks/useBaseItems";
import {
  getEffectiveInvNumber,
  resolveLinkToInventuraState,
} from "@/utils/inventoryStates";

/**
 * QR found in master data but not on current inventura: lookup + link into inventura.
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
    async (location = null, { markAsFound = true } = {}) => {
      if (!outsideInventuraItem?.id || !stocktakingId) {
        return null;
      }
      const invCode = getEffectiveInvNumber(outsideInventuraItem);
      if (!invCode) {
        throw new Error("Položka nemá inventární číslo — nelze ji přidat do inventury.");
      }
      const created = await linkToEvent({
        rmId: outsideInventuraItem.id,
        eventId: stocktakingId,
        status: resolveLinkToInventuraState(markAsFound),
        note: outsideInventuraItem.note || "",
        qr: invCode,
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
