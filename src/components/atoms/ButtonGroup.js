import React from 'react';

export default function ButtonGroup({ 
  options = [], 
  value, 
  onChange, 
  iconPosition = "left",
  orientation = "horizontal",
  style = {},
  ...props 
}) {
  const isVertical = orientation === "vertical";
  
  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: isVertical ? "column" : "row",
        borderRadius: "8px",
        overflow: "hidden",
        border: isVertical ? "none" : "1px solid #e0e0e0",
        gap: isVertical ? "0.25rem" : "0",
        ...style 
      }}
      {...props}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              flex: isVertical ? "none" : 1,
              padding: "0.75rem",
              border: isVertical ? "1px solid #e0e0e0" : "none",
              borderRadius: isVertical ? "8px" : "0",
              backgroundColor: isSelected ? "#282828" : "#fff",
              color: isSelected ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: isSelected ? 600 : 400,
              display: "flex",
              alignItems: "center",
              justifyContent: iconPosition === "left" ? "flex-start" : "space-between",
              gap: "0.5rem",
              borderRight: isVertical ? "1px solid #e0e0e0" : (isLast ? "none" : "1px solid #e0e0e0"),
              transition: "all 0.2s ease",
              minHeight: isVertical ? "44px" : "auto",
              width: isVertical ? "100%" : "auto",
              ...(isVertical ? {} : {
                ...(isFirst && { borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }),
                ...(isLast && { borderTopRightRadius: "8px", borderBottomRightRadius: "8px" })
              }),
              ...(isSelected && {
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
              })
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.target.style.backgroundColor = "#f5f5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.target.style.backgroundColor = "#fff";
              }
            }}
          >
            {option.icon && iconPosition === "left" && (
              <span className="material-icons-round" style={{ fontSize: "16px" }}>
                {option.icon}
              </span>
            )}
            {option.label}
            {option.icon && iconPosition === "right" && (
              <span className="material-icons-round" style={{ fontSize: "16px" }}>
                {option.icon}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
