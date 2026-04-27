"use client";

import React, { memo } from "react";
import Link from "next/link";
import StocktakingItemCard from "@/components/organisms/StocktakingItemCard";
import StocktakingItemCardSkeleton from "@/components/organisms/StocktakingItemCardSkeleton";

const MemoStocktakingItemCard = memo(StocktakingItemCard, (prev, next) => {
    if (prev.compact !== next.compact) return false;
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

function ItemLink({ stocktakingId, itemId, children, onNavigate }) {
    return (
        <Link
            href={`/stocktakingList/${stocktakingId}/${itemId}`}
            scroll={false}
            onClick={() => onNavigate?.(itemId)}
            style={{ textDecoration: "none" }}
            data-feed-item-id={itemId}
        >
            {children}
        </Link>
    );
}

/**
 * List + skeletons for stocktaking list page (grid / detailed / compact).
 */
function AppendSkeletonTail({ viewMode, pageSize }) {
    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-2 gap-4 auto-rows-fr mt-4">
                {Array.from({ length: pageSize }, (_, index) => (
                    <StocktakingItemCardSkeleton key={`append-skel-${index}`} compact={false} />
                ))}
            </div>
        );
    }
    if (viewMode === "detailed") {
        return (
            <>
                {Array.from({ length: pageSize }, (_, index) => (
                    <StocktakingItemCardSkeleton key={`append-skel-${index}`} compact={false} />
                ))}
            </>
        );
    }
    return (
        <>
            {Array.from({ length: pageSize }, (_, index) => (
                <StocktakingItemCardSkeleton key={`append-skel-${index}`} compact={true} />
            ))}
        </>
    );
}

export default function StocktakingListItemViews({
    viewMode,
    loading,
    appendLoading = false,
    items,
    stocktakingId,
    pageSize,
    renderItemActions,
    onItemNavigate
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
            <>
                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                    {items.map((item) => (
                        <ItemLink key={item.id} stocktakingId={stocktakingId} itemId={item.id} onNavigate={onItemNavigate}>
                            <MemoStocktakingItemCard
                                item={item}
                                renderActions={renderItemActions}
                                compact={false}
                                enableLazyImageFetch={true}
                            />
                        </ItemLink>
                    ))}
                </div>
                {appendLoading ? <AppendSkeletonTail viewMode="grid" pageSize={pageSize} /> : null}
            </>
        );
    }

    if (viewMode === "detailed") {
        return (
            <>
                {items.map((item) => (
                    <ItemLink key={item.id} stocktakingId={stocktakingId} itemId={item.id} onNavigate={onItemNavigate}>
                        <MemoStocktakingItemCard
                            item={item}
                            renderActions={renderItemActions}
                            compact={false}
                            enableLazyImageFetch={true}
                        />
                    </ItemLink>
                ))}
                {appendLoading ? <AppendSkeletonTail viewMode="detailed" pageSize={pageSize} /> : null}
            </>
        );
    }

    return (
        <>
            {items.map((item) => (
                <ItemLink key={item.id} stocktakingId={stocktakingId} itemId={item.id} onNavigate={onItemNavigate}>
                    <MemoStocktakingItemCard
                        item={item}
                        renderActions={renderItemActions}
                        compact={true}
                        enableLazyImageFetch={true}
                    />
                </ItemLink>
            ))}
            {appendLoading ? <AppendSkeletonTail viewMode="compact" pageSize={pageSize} /> : null}
        </>
    );
}
