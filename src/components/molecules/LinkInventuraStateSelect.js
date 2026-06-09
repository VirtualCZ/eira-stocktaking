"use client";

import DropdownCard from "@/components/molecules/DropdownCard";
import {
  DEFAULT_LINK_INVENTURA_STATE,
  LINK_INVENTURA_STATE_OPTIONS,
} from "@/utils/inventoryStates";

export default function LinkInventuraStateSelect({
  value = DEFAULT_LINK_INVENTURA_STATE,
  onChange,
  label = "Stav v inventuře",
  disabled = false,
}) {
  const selected =
    LINK_INVENTURA_STATE_OPTIONS.find((option) => option.value === value) ??
    LINK_INVENTURA_STATE_OPTIONS[0];

  return (
    <DropdownCard
      label={label}
      options={LINK_INVENTURA_STATE_OPTIONS}
      selected={selected}
      disabled={disabled}
      onSelect={(option) => onChange?.(option.value)}
    />
  );
}
