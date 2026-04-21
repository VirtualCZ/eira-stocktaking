"use client";

import React, { memo } from "react";
import Link from "next/link";
import StocktakingItemCard from "@/components/organisms/StocktakingItemCard";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";

const MemoStocktakingItemCard = memo(StocktakingItemCard, (prev, next) => {
    if (prev.compact !== next.compact) return false;
    if (prev.imagesResolvedForCurrentPage !== next.imagesResolvedForCurrentPage) return false;
    if (prev.renderActions !== next.renderActions) return false;
    const a = prev.item;
    const b = next.item;
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.id === b.id &&
        a.name === b.name &&
        a.description === b.description &&
        a.note === b.note &&
        a.state === b.state &&
        a.lastCheck === b.lastCheck &&
        a.image === b.image
    );
});
MemoStocktakingItemCard.displayName = "MemoStocktakingItemCard";

function ItemLink({ stocktakingId, itemId, children }) {
    return (
        <Link href={`/stocktakingList/${stocktakingId}/${itemId}`} style={{ textDecoration: "none" }}>
            {children}
        </Link>
    );
}

/**
 * List + skeletons for stocktaking list page (grid / detailed / compact).
 */
export default function StocktakingListItemViews({
    viewMode,
    loading,
    items,
    stocktakingId,
    pageSize,
    renderItemActions,
    imagesResolvedForCurrentPage
}) {
    if (loading) {
        if (viewMode === "grid") {
            return (
                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                    {Array.from({ length: pageSize }, (_, index) => (
                        <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={false} />
                    ))}
                </div>
            );
        }
        if (viewMode === "detailed") {
            return Array.from({ length: pageSize }, (_, index) => (
                <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={false} />
            ));
        }
        return Array.from({ length: pageSize }, (_, index) => (
            <StocktakingItemCardSkeleton key={`skeleton-${index}`} compact={true} />
        ));
    }

    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                {items.map((item) => (
                    <ItemLink key={item.id} stocktakingId={stocktakingId} itemId={item.id}>
                        <MemoStocktakingItemCard
                            item={item}
                            renderActions={renderItemActions}
                            compact={false}
                            imagesResolvedForCurrentPage={imagesResolvedForCurrentPage}
                        />
                    </ItemLink>
                ))}
            </div>
        );
    }

    if (viewMode === "detailed") {
        return items.map((item) => (
            <ItemLink key={item.id} stocktakingId={stocktakingId} itemId={item.id}>
                <MemoStocktakingItemCard
                    item={item}
                    renderActions={renderItemActions}
                    compact={false}
                    imagesResolvedForCurrentPage={imagesResolvedForCurrentPage}
                />
            </ItemLink>
        ));
    }

    return items.map((item) => (
        <ItemLink key={item.id} stocktakingId={stocktakingId} itemId={item.id}>
            <MemoStocktakingItemCard
                item={item}
                renderActions={renderItemActions}
                compact={true}
                imagesResolvedForCurrentPage={imagesResolvedForCurrentPage}
            />
        </ItemLink>
    ));
}
