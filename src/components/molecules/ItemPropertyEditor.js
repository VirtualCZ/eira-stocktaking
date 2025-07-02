import React from "react";
import TextInput from "../inputs/TextInput";
import CardContainer from "../CardContainer";
import Button from '../inputs/Button';

// Helper to generate a unique id
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default function ItemPropertyEditor({ properties = [], onChange }) {
  // Ensure all properties have an id
  const normalizedProps = properties.map(p => p.id ? p : { ...p, id: generateId() });

  const handleKeyChange = (idx, newKey) => {
    if (normalizedProps.some((p, i) => i !== idx && p.key === newKey)) return;
    const newProps = normalizedProps.map((p, i) => i === idx ? { ...p, key: newKey } : p);
    onChange(newProps);
  };

  const handleValueChange = (idx, value) => {
    const newProps = normalizedProps.map((p, i) => i === idx ? { ...p, value } : p);
    onChange(newProps);
  };

  const handleDelete = (idx) => {
    const newProps = normalizedProps.filter((_, i) => i !== idx);
    onChange(newProps);
  };

  const handleAdd = () => {
    let idx = 1;
    let newKey = "";
    const existingKeys = normalizedProps.map(p => p.key);
    while (existingKeys.includes("new" + idx)) idx++;
    newKey = "new" + idx;
    onChange([...normalizedProps, { key: newKey, value: "", id: generateId() }]);
  };

  return (
    <CardContainer className="">
      {normalizedProps.map(({ key, value, id }, idx) => (
        <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={key}
            onChange={e => handleKeyChange(idx, e.target.value)}
            label={idx === 0 ? "Vlastnost" : undefined}
            placeholder="Název"
          />
          <TextInput
            value={value}
            onChange={e => handleValueChange(idx, e.target.value)}
            label={idx === 0 ? "Hodnota" : undefined}
            placeholder="Hodnota"
          />
          <button
            type="button"
            onClick={() => handleDelete(idx)}
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
      <Button icon="add" iconPosition="right" type="button" onClick={handleAdd} style={{ fontSize: "0.75rem" }} className="mt-2">
        Přidat vlastnost
      </Button>
    </CardContainer>
  );
} 