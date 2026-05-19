/** Suggested inventární číslo / QR for a duplicate (user can edit before confirming). */
export function suggestDuplicateIdentifier(originalCode) {
  const base = String(originalCode ?? "").trim();
  if (!base) return "";
  return `${base}-kopie`;
}
