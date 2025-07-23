import React from "react";
import CardItemName from "@/components/atoms/CardItemName";
import CardItemDescription from "@/components/atoms/CardItemDescription";
import CardItemNote from "@/components/atoms/CardItemNote";
import CardItemDate from "@/components/atoms/CardItemDate";

// Map state to background color - using subtle, professional colors
const stateBgColors = {
  zbyva: "#f0f1f3",      // Default grey - remaining items
  nalezeno: "#e8f5e8",   // Very light green - found items
  presun: "#e8f0f8",     // Very light blue - moved items
  novy: "#f8f4e8",       // Very light beige - new items
};

export default function StocktakingItemCard({ item, renderActions, compact = false }) {
  // Determine background color based on item.state
  const bgColor = item.state && stateBgColors[item.state] ? stateBgColors[item.state] : "#f0f1f3";
  return (
    <div
      className={compact ? "flex flex-col rounded-2xl overflow-hidden p-4" : "flex flex-col rounded-2xl overflow-hidden h-full"}
      style={{ background: bgColor }}
    >
      {/* Image (only in full mode) */}
      {!compact && item.image && (
        <img
          src={
            /^data:image\//.test(item.image)
              ? item.image
              : (/^[A-Za-z0-9+/=]+$/.test(item.image) && item.image.length > 100)
                ? `data:image/*;base64,${item.image}`
                : item.image
          }
          alt={item.name}
          style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
        />
      )}
      {/* Content */}
      <div className={compact ? "flex flex-col gap-1" : "p-4 flex flex-col justify-between flex-grow"}>
        {/* First part */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardItemName>{item.name}</CardItemName>
            {renderActions && renderActions(item)}
          </div>
          <CardItemDescription>{item.description}</CardItemDescription>
          <CardItemNote showLabel={false}>{item.note}</CardItemNote>
        </div>
        {/* Second part */}
        <CardItemDate>
          Poslední kontrola {item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}
        </CardItemDate>
      </div>
    </div>
  );
} 