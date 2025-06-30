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
            className="flex items-center justify-center hover:opacity-80 active:opacity-80 focus:opacity-80"
            style={{
              borderRadius: "0.5rem",
              padding: "0.75rem",
              border: "none",
              background: "#FF6262",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: 8
            }}
            title="Odebrat"
          >
            <span className="material-icons-round" style={{ color: "#000", fontSize: 16 }}>delete</span>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
        style={{ fontSize: "0.75rem" }}
      >
        Přidat vlastnost
        <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>add</span>
      </button>
    </CardContainer>
  );
} 