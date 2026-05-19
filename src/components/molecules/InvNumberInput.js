"use client";

import TextInput from "@/components/atoms/TextInput";

export default function InvNumberInput({
  value,
  onChange,
  editMode = true,
  checking = false,
  available = null,
  checkError = null,
}) {
  const trimmed = String(value ?? "").trim();
  const showConflict = editMode && trimmed && available === false;
  const showOk = editMode && trimmed && available === true && !checking;

  if (!editMode) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ color: "#535353", fontWeight: 500, fontSize: 14 }}>
          Inventurizační číslo:
        </div>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
          {trimmed || "—"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <TextInput
        label="Inventurizační číslo"
        placeholder="Zadejte inventurizační číslo"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {trimmed && checking && (
        <div style={{ fontSize: 12, color: "#535353" }}>Kontroluji číslo…</div>
      )}
      {showConflict && (
        <div style={{ fontSize: 12, color: "#FF6262", fontWeight: 600 }}>
          Toto inventurizační číslo je již použito (včetně jako QR v inventuře).
        </div>
      )}
      {showOk && (
        <div style={{ fontSize: 12, color: "#2ecc40", fontWeight: 600 }}>
          Inventurizační číslo je volné.
        </div>
      )}
      {checkError && (
        <div style={{ fontSize: 12, color: "#FF6262" }}>
          Nepodařilo se ověřit inventurizační číslo.
        </div>
      )}
    </div>
  );
}
