"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useParams } from "next/navigation";
import { usePageState } from "@/hooks/usePageState";
import { useStocktakingFeed } from "@/hooks/useStocktakingFeed";

const StocktakingListLayoutContext = createContext(null);

export function StocktakingListLayoutProvider({ children }) {
    const params = useParams();
    const stocktakingId = Number.parseInt(String(params?.id ?? ""), 10);
    const canFetch = Number.isFinite(stocktakingId) && stocktakingId > 0;

    const [pageState, updatePageState] = usePageState(`stocktakingList_${stocktakingId}`, {
        sortBy: "id",
        sortOrder: "asc",
        viewMode: "detailed",
        searchTerm: "",
        filterState: { state: [], hasNote: [] },
    });

    const [location, setLocation] = useState(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("selectedLocation");
            return raw ? JSON.parse(raw) : null;
        } catch (_e) {
            return null;
        }
    });

    const hasLocationFilter = Boolean(location?.building || location?.storey || location?.room);

    const isSameLocation = useCallback((a, b) => {
        const aBuilding = a?.building ?? null;
        const aStorey = a?.storey ?? null;
        const aRoom = a?.room ?? null;
        const bBuilding = b?.building ?? null;
        const bStorey = b?.storey ?? null;
        const bRoom = b?.room ?? null;
        return aBuilding === bBuilding && aStorey === bStorey && aRoom === bRoom;
    }, []);

    const handleLocationChange = useCallback(
        (nextLocation) => {
            setLocation((prev) => (isSameLocation(prev, nextLocation) ? prev : nextLocation));
        },
        [isSameLocation]
    );

    const feed = useStocktakingFeed({
        eventId: stocktakingId,
        sortBy: pageState.sortBy,
        sortOrder: pageState.sortOrder,
        searchTerm: pageState.searchTerm,
        filterState: pageState.filterState,
        location: hasLocationFilter ? location : null,
        enabled: canFetch,
    });

    const value = {
        stocktakingId,
        canFetch,
        pageState,
        updatePageState,
        location,
        setLocation,
        handleLocationChange,
        hasLocationFilter,
        ...feed,
    };

    return (
        <StocktakingListLayoutContext.Provider value={value}>
            {children}
        </StocktakingListLayoutContext.Provider>
    );
}

export function useStocktakingListLayout() {
    const ctx = useContext(StocktakingListLayoutContext);
    if (!ctx) {
        throw new Error("useStocktakingListLayout must be used under app/stocktakingList/[id]");
    }
    return ctx;
}
