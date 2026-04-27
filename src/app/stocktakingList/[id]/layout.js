"use client";

import { StocktakingListLayoutProvider } from "@/contexts/StocktakingListLayoutContext";

export default function StocktakingIdLayout({ children }) {
    return <StocktakingListLayoutProvider>{children}</StocktakingListLayoutProvider>;
}
