import React from "react";
import CardItemName from "@/components/atoms/CardItemName";
import CardItemDescription from "@/components/atoms/CardItemDescription";
import CardItemNote from "@/components/atoms/CardItemNote";
import CardItemDate from "@/components/atoms/CardItemDate";
import { useItemImage } from "@/hooks/useItemImage";
import { INVENTORY_STATES } from "@/utils/inventoryStates";

// Map state to background color - using subtle, professional colors
const stateBgColors = {
  [INVENTORY_STATES.NOT_FOUND]: "#fbe9e9",
  [INVENTORY_STATES.FOUND]: "#e7f6ec",
  [INVENTORY_STATES.MOVED]: "#e8f1fc",
  [INVENTORY_STATES.NEW]: "#e6f4f1",
  [INVENTORY_STATES.UNCHECKED]: "#eef1f5",
};

export default function StocktakingItemCard({
  item,
  renderActions,
  compact = false,
  imagesResolvedForCurrentPage = false,
  enableLazyImageFetch = false,
  showInventoryDetails = true,
  useStateColor = true
}) {
  // In base-RM contexts, we must ignore inventory state colorization completely.
  const bgColor = useStateColor && item.state && stateBgColors[item.state]
    ? stateBgColors[item.state]
    : stateBgColors[INVENTORY_STATES.UNCHECKED];
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const imageRef = React.useRef(null);
  const { containerRef, imageSrc, isWaitingForLazyImage } = useItemImage({
    itemId: item?.id,
    itemImage: item?.image,
    compact,
    enableLazyImageFetch,
  });

  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageSrc, item.id]);

  const showImage = !compact && imageSrc && !imageError;
  const showLoadingPlaceholder = !compact && isWaitingForLazyImage;
  const showNoImagePlaceholder = !compact && !isWaitingForLazyImage && (imageError || !imageSrc);

  React.useEffect(() => {
    if (!showImage) return;
    const img = imageRef.current;
    if (!img) return;
    // Safari may serve cached images without firing onLoad reliably.
    if (img.complete) {
      if (img.naturalWidth > 0) {
        setImageLoaded(true);
      } else {
        setImageError(true);
      }
    }
  }, [showImage, imageSrc]);

  return (
    <div
      ref={containerRef}
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
            key={`${item.id}-${imageSrc}`}
            ref={imageRef}
            src={imageSrc}
            alt={item.name}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: 100,
              objectFit: "cover",
              visibility: imageLoaded ? "visible" : "hidden"
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
          {showInventoryDetails ? (
            <CardItemNote showLabel={false}>{item.note}</CardItemNote>
          ) : null}
        </div>
        {/* Second part */}
        {showInventoryDetails ? (
          <CardItemDate>
            Poslední kontrola {item.lastCheck ? new Date(item.lastCheck).toLocaleString() : ""}
          </CardItemDate>
        ) : null}
      </div>
    </div>
  );
} 