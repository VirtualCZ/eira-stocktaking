import React from "react";
import TextInput from "../inputs/TextInput";
import CardContainer from "../CardContainer";

export default function ItemPropertyEditor({ properties = {}, onChange }) {
  const handleKeyChange = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey) return;
    const newProps = { ...properties };
    if (!newProps[newKey]) {
      newProps[newKey] = newProps[oldKey];
      delete newProps[oldKey];
      onChange(newProps);
    }
  };

  const handleValueChange = (key, value) => {
    const newProps = { ...properties, [key]: value };
    onChange(newProps);
  };

  const handleDelete = (key) => {
    const newProps = { ...properties };
    delete newProps[key];
    onChange(newProps);
  };

  const handleAdd = () => {
    const newProps = { ...properties };
    let idx = 1;
    let newKey = "";
    while (newProps["new" + idx]) idx++;
    newKey = "new" + idx;
    newProps[newKey] = "";
    onChange(newProps);
  };

  return (
    <CardContainer className="gap-2">
      {Object.entries(properties).map(([key, value], idx) => (
        <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={key}
            onChange={e => handleKeyChange(key, e.target.value)}
            label={idx === 0 ? "Vlastnost" : undefined}
            placeholder="Název"
          />
          <TextInput
            value={value}
            onChange={e => handleValueChange(key, e.target.value)}
            label={idx === 0 ? "Hodnota" : undefined}
            placeholder="Hodnota"
          />
          <button
            type="button"
            onClick={() => handleDelete(key)}
            style={{
              borderRadius: "0.5rem",
              padding: "0.75rem",
              border: "none",
              background: "#FF6262",
              display: "flex",
              alignItems: "center",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Smazat vlastnost"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        style={{
          borderRadius: "0.5rem",
          padding: "0.75rem",
          border: "none",
          background: "#1976d2",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
          marginTop: 8
        }}
      >
        Přidat vlastnost
      </button>
    </CardContainer>
  );
} 