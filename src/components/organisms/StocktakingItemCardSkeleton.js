import React from "react";

export default function StocktakingItemCardSkeleton({ compact = false }) {
  return (
    <div
      className={compact ? "flex flex-col rounded-2xl overflow-hidden p-4" : "flex flex-col rounded-2xl overflow-hidden h-full"}
      style={{ background: "#f0f1f3" }}
    >
      {/* Image skeleton (only in full mode) */}
      {!compact && (
        <div 
          style={{ 
            width: "100%", 
            height: 100, 
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite"
          }} 
        />
      )}
      {/* Content skeleton */}
      <div className={compact ? "flex flex-col gap-1" : "p-4 flex flex-col justify-between flex-grow"}>
        {/* First part */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Name skeleton */}
            <div 
              style={{ 
                height: 20, 
                width: "60%", 
                background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "loading 1.5s infinite",
                borderRadius: 4
              }} 
            />
            {/* Actions skeleton */}
            <div 
              style={{ 
                height: 20, 
                width: 24, 
                background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "loading 1.5s infinite",
                borderRadius: 4
              }} 
            />
          </div>
          {/* Description skeleton */}
          <div 
            style={{ 
              height: 16, 
              width: "80%", 
              marginTop: 8,
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: 4
            }} 
          />
          {/* Note skeleton */}
          <div 
            style={{ 
              height: 14, 
              width: "70%", 
              marginTop: 4,
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: 4
            }} 
          />
        </div>
        {/* Second part - Date skeleton */}
        <div 
          style={{ 
            height: 14, 
            width: "50%", 
            marginTop: 8,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
            borderRadius: 4
          }} 
        />
      </div>
    </div>
  );
} 