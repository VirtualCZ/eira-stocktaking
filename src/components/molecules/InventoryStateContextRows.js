import { ContextRow } from "@/components/molecules/ContextMenu";
import {
  shouldShowMarkFoundAction,
  shouldShowMarkNotFoundAction,
} from "@/utils/inventoryStates";

/**
 * Returns ContextRow elements to spread inside ContextButton — not a wrapper
 * component, because ContextButton only styles direct ContextRow children.
 */
export function buildInventoryStateContextRows({
  state,
  onMarkFound,
  onMarkNotFound,
}) {
  const rows = [];
  if (shouldShowMarkFoundAction(state)) {
    rows.push(
      <ContextRow
        key="mark-found"
        icon="visibility"
        label="Nalezeno"
        action={onMarkFound}
      />
    );
  }
  if (shouldShowMarkNotFoundAction(state)) {
    rows.push(
      <ContextRow
        key="mark-not-found"
        icon="visibility_off"
        label="Nenalezeno"
        action={onMarkNotFound}
      />
    );
  }
  return rows;
}
