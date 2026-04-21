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

export default function StocktakingItemCard({ item, renderActions, compact = false, imagesResolvedForCurrentPage = false }) {
  // Determine background color based on item.state
  const bgColor = item.state && stateBgColors[item.state] ? stateBgColors[item.state] : "#f0f1f3";
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const imageSrc = item.image
    ? (
      /^data:image\//.test(item.image)
        ? item.image
        : (/^[A-Za-z0-9+/=]+$/.test(item.image) && item.image.length > 100)
          ? `data:image/*;base64,${item.image}`
          : item.image
    )
    : null;

  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageSrc, item.id]);

  const showImage = !compact && imageSrc && !imageError;
  const showLoadingPlaceholder = !compact && !imageSrc && !imagesResolvedForCurrentPage;
  const showNoImagePlaceholder = !compact && (imageError || (!imageSrc && imagesResolvedForCurrentPage));

  return (
    <div
      className={compact ? "flex flex-col rounded-2xl overflow-hidden p-4" : "flex flex-col rounded-2xl overflow-hidden h-full"}
      style={{ background: bgColor }}
    >
      {/* Image (only in full mode) */}
      {showImage && (
        <>
          {!imageLoaded && (
            <div
              className="image-placeholder-pulse"
              style={{
                width: "100%",
                height: 100,
                background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                backgroundSize: "200% 100%"
              }}
            />
          )}
          <img
            src={imageSrc}
            alt={item.name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: 100,
              objectFit: "cover",
              display: imageLoaded ? "block" : "none"
            }}
          />
        </>
      )}
      {showLoadingPlaceholder && (
        <div
          className="image-placeholder-pulse"
          style={{
            width: "100%",
            height: 100,
            background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
            backgroundSize: "200% 100%"
          }}
        />
      )}
      {showNoImagePlaceholder && (
        <div
          style={{
            width: "100%",
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            color: "#9ca3af"
          }}
          aria-label="No image available"
        >
          <span className="material-icons-round" style={{ fontSize: 22 }}>image_not_supported</span>
        </div>
      )}
      <style jsx>{`
        .image-placeholder-pulse {
          animation: imagePlaceholderPulse 1.2s linear infinite;
        }
        @keyframes imagePlaceholderPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
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