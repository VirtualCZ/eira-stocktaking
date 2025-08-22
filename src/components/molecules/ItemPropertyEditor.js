import React from "react";
import TextInput from "@/components/atoms/TextInput";
import CardContainer from "@/components/atoms/CardContainer";
import Button from "@/components/atoms/Button";

// Helper to get appropriate input type based on fieldType
function getInputType(fieldType) {
  switch (fieldType) {
    case 'entproptype_date':
      return 'date';
    case 'entproptype_timestamp':
      return 'datetime-local';
    case 'entproptype_decimal':
    case 'entproptype_numeric':
      return 'number';
    case 'entproptype_text':
      return 'text';
    case 'entproptype_alphanumeric':
    default:
      return 'text';
  }
}

// Helper to format value for display based on fieldType
function formatValueForDisplay(value, fieldType) {
  if (!value) return '';
  
  switch (fieldType) {
    case 'entproptype_date':
    case 'entproptype_timestamp':
      if (typeof value === 'string' && value.includes('T')) {
        // Convert ISO string to local datetime-local format
        const date = new Date(value);
        if (fieldType === 'entproptype_date') {
          return date.toISOString().split('T')[0];
        } else {
          return date.toISOString().slice(0, 16);
        }
      }
      return value;
    default:
      return value;
  }
}

// Helper to generate a unique id
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default function ItemPropertyEditor({ properties = [], onChange }) {
  const normalizedProps = properties.map(p => {
    if (p.id) return p;
    return {
      ...p,
      id: generateId(),
      key: p.metaCode || p.label,
      priority: p.priority || 0
    };
  });

  const handleKeyChange = (idx, newKey) => {
    if (normalizedProps.some((p, i) => i !== idx && p.key === newKey)) return;
    const newProps = normalizedProps.map((p, i) => i === idx ? { ...p, key: newKey } : p);
    onChange(newProps);
  };

  const handleValueChange = (idx, value) => {
    const newProps = normalizedProps.map((p, i) => i === idx ? { ...p, value } : p);
    onChange(newProps);
  };

  // Removed handleDelete function - no more deleting properties

  // Removed handleAdd function - no more adding new properties

    // Don't render anything if there are no properties
  if (normalizedProps.length === 0) {
    return null;
  }

  return (
    <CardContainer className="">
      {normalizedProps
        .sort((a, b) => (a.priority || 0) - (b.priority || 0)) // Sort by priority
        .map(({ key, value, id, label, fieldType }, idx) => (
        <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={label}
            onChange={e => handleKeyChange(idx, e.target.value)}
            label={idx === 0 ? "Vlastnost" : undefined}
            placeholder="Název"
            disabled={true} // Always disabled since we only have API-defined properties now
          />
          <TextInput
            value={formatValueForDisplay(value, fieldType)}
            onChange={e => handleValueChange(idx, e.target.value)}
            label={idx === 0 ? "Hodnota" : undefined}
            placeholder="Hodnota"
            type={getInputType(fieldType)}
          />
        </div>
      ))}
    </CardContainer>
  );
} 