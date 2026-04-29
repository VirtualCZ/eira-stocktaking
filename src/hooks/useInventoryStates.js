import { useEffect, useState } from "react";
import { getAuthHeadersSafe } from "@/utils/token";
import { INVENTORY_STATES } from "@/utils/inventoryStates";

const FALLBACK_OPTIONS = [
  { value: INVENTORY_STATES.NOT_FOUND, label: INVENTORY_STATES.NOT_FOUND },
  { value: INVENTORY_STATES.FOUND, label: INVENTORY_STATES.FOUND },
  { value: INVENTORY_STATES.MOVED, label: INVENTORY_STATES.MOVED },
  { value: INVENTORY_STATES.NEW, label: INVENTORY_STATES.NEW },
  { value: INVENTORY_STATES.UNCHECKED, label: INVENTORY_STATES.UNCHECKED },
];

export function useInventoryStates() {
  const [options, setOptions] = useState(FALLBACK_OPTIONS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/states", {
          method: "GET",
          headers: getAuthHeadersSafe(),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setOptions(data);
        }
      } catch (_err) {
        // Keep fallback options.
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}

