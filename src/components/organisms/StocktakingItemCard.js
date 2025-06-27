import React from "react";
import CardItemName from "../molecules/CardItemName";
import CardItemDescription from "../molecules/CardItemDescription";
import CardItemNote from "../molecules/CardItemNote";
import CardItemDate from "../molecules/CardItemDate";

export default function StocktakingItemCard({ item, renderActions, compact = false }) {
  return (
    <div
      className={compact ? "flex flex-col rounded-2xl overflow-hidden bg-[#f0f1f3] p-4" : "flex flex-col rounded-2xl overflow-hidden bg-[#f0f1f3] h-full"}
      style={compact ? {} : {}}
    >
      {/* Image (only in full mode) */}
      {!compact && item.image && (
        <img
          src={item.image}
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