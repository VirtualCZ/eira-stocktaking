export const INVENTORY_STATES = {
  NOT_FOUND: "state_rm_inventura_nenalezeno",
  FOUND: "state_rm_inventura_nalezeno",
  MOVED: "state_rm_inventura_presun",
  NEW: "state_rm_inventura_novy",
  UNCHECKED: "state_rm_inventura_nezkontrolovano",
};

/** All inventory row states except “nezkontrolováno” (for default feed when hiding unchecked). */
export const INVENTORY_STATES_WITHOUT_UNCHECKED = [
  INVENTORY_STATES.NOT_FOUND,
  INVENTORY_STATES.FOUND,
  INVENTORY_STATES.MOVED,
  INVENTORY_STATES.NEW,
];

function matchesInventoryState(value, stateConst) {
  if (value == null) return false;
  const n = String(value).trim();
  return n === stateConst || n.toLowerCase() === stateConst.toLowerCase();
}

export function isFoundState(value) {
  return matchesInventoryState(value, INVENTORY_STATES.FOUND);
}

export function isMovedState(value) {
  return matchesInventoryState(value, INVENTORY_STATES.MOVED);
}

export function isNewState(value) {
  return matchesInventoryState(value, INVENTORY_STATES.NEW);
}

/** Inventura list mode (settings): full list vs workflow without „Nezkontrolováno“. */
export const INVENTORY_DISPLAY_MODE = {
  FULL: "full",
  WORKFLOW: "workflow",
};

