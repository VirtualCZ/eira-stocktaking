import { useState, useCallback } from "react";

/** Modal open/close + confirm flow for item duplication. */
export function useDuplicateItemModal(duplicateItem) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const confirm = useCallback(
    async (code, itemId) => {
      if (!itemId) return { ok: false };
      const result = await duplicateItem(itemId, code);
      setIsOpen(false);
      if (!result) return { ok: false };
      return { ok: true, result, newId: result.id };
    },
    [duplicateItem]
  );

  return { isOpen, open, close, confirm };
}
