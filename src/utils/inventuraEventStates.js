export const EVENT_STATE_INITIATED = "state_im_event_initiated";
export const EVENT_STATE_CLOSED = "state_im_event_closed";

export const CLOSED_INVENTURA_MESSAGE =
  "Je vybrána již uzavřená inventura. Vyberte prosím jinou inventuru v seznamu.";

/** Only „Zahájený“ inventury can be worked with in the mobile app. */
export function isInventuraActive(inventura) {
  return inventura?.state === EVENT_STATE_INITIATED;
}

export function isInventuraClosed(inventura) {
  if (!inventura) return false;
  return !isInventuraActive(inventura);
}
