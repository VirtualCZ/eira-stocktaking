"use client";

import { BaseItemsInventoryLayoutProvider } from "@/contexts/BaseItemsInventoryLayoutContext";

export default function InventorySegmentLayout({ children }) {
    return <BaseItemsInventoryLayoutProvider>{children}</BaseItemsInventoryLayoutProvider>;
}
