export const INVENTORY_STATES = {
  NOT_FOUND: "state_rm_inventura_nenalezeno",
  FOUND: "state_rm_inventura_nalezeno",
  MOVED: "state_rm_inventura_presun",
  NEW: "state_rm_inventura_novy",
  UNCHECKED: "state_rm_inventura_nezkontrolovano",
};

export function isFoundState(value) {
  return value === INVENTORY_STATES.FOUND;
}

