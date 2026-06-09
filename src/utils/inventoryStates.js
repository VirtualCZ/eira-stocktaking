export const INVENTORY_STATES = {
  NOT_FOUND: "state_rm_inventura_nenalezeno",
  FOUND: "state_rm_inventura_nalezeno",
  MOVED: "state_rm_inventura_presun",
  /** Same practical bucket as FOUND — row newly created or linked in this inventura */
  NEW: "state_rm_inventura_novy",
  /** Asset in master data, not yet part of this inventura workflow */
  UNCHECKED: "state_rm_inventura_nezkontrolovano",
};

/** Row is on the inventura list and treated as present (Nový or Nalezeno). */
export const INVENTURA_PRESENT_STATES = [
  INVENTORY_STATES.NEW,
  INVENTORY_STATES.FOUND,
];

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

export function isNotFoundState(value) {
  return matchesInventoryState(value, INVENTORY_STATES.NOT_FOUND);
}

/** Nový rows keep Nový — no found/not-found toggles. */
export function isStateLockedAsNew(state) {
  return isNewState(state);
}

/** Show “Nalezeno” unless already nalezeno or locked as Nový. */
export function shouldShowMarkFoundAction(state) {
  if (isStateLockedAsNew(state)) return false;
  return !isFoundState(state);
}

/** Show “Nenalezeno” unless already nenalezeno or locked as Nový. */
export function shouldShowMarkNotFoundAction(state) {
  if (isStateLockedAsNew(state)) return false;
  return !isNotFoundState(state);
}

/** Move updates location; Nový stays Nový, everything else becomes Přesun. */
export function resolveStateForMove(currentState) {
  if (isNewState(currentState)) return INVENTORY_STATES.NEW;
  return INVENTORY_STATES.MOVED;
}

/** Any update that would change state keeps Nový when the row is already Nový. */
export function resolveStateForUpdate(requestedState, currentState) {
  if (isNewState(currentState)) return INVENTORY_STATES.NEW;
  return requestedState;
}

/** Inventární číslo z RM (invNumber) nebo záložní QR z rminv. */
export function getEffectiveInvNumber(item) {
  if (item == null) return "";
  const inv = String(item.invNumber ?? "").trim();
  const qr = String(item.qr ?? "").trim();
  return inv || qr;
}

/** Stav při propojení na link stránce (nikdy Nový / Přesun). */
export const LINK_INVENTURA_STATE_OPTIONS = [
  { text: "Nezkontrolováno", value: INVENTORY_STATES.UNCHECKED },
  { text: "Nalezeno", value: INVENTORY_STATES.FOUND },
  { text: "Nenalezeno", value: INVENTORY_STATES.NOT_FOUND },
];

export const DEFAULT_LINK_INVENTURA_STATE = INVENTORY_STATES.UNCHECKED;

const LINK_INVENTURA_ALLOWED_STATES = new Set(
  LINK_INVENTURA_STATE_OPTIONS.map((option) => option.value)
);

/** Propojení do inventury: Nezkontrolováno, Nalezeno, Nenalezeno (nikdy Nový). */
export function resolveLinkToInventuraState(statusOrMarkAsFound) {
  if (typeof statusOrMarkAsFound === "boolean") {
    return statusOrMarkAsFound ? INVENTORY_STATES.FOUND : INVENTORY_STATES.UNCHECKED;
  }
  const normalized = String(statusOrMarkAsFound ?? "").trim();
  if (LINK_INVENTURA_ALLOWED_STATES.has(normalized)) {
    return normalized;
  }
  return INVENTORY_STATES.UNCHECKED;
}

export function isMovedState(value) {
  return matchesInventoryState(value, INVENTORY_STATES.MOVED);
}

export function isNewState(value) {
  return matchesInventoryState(value, INVENTORY_STATES.NEW);
}

export function isPresentInInventuraState(value) {
  return INVENTURA_PRESENT_STATES.some((state) =>
    matchesInventoryState(value, state)
  );
}

/** Inventura list mode (settings): full list vs workflow without „Nezkontrolováno“. */
export const INVENTORY_DISPLAY_MODE = {
  FULL: "full",
  WORKFLOW: "workflow",
};

