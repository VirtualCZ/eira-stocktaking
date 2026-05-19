"use client";

import { useParams } from "next/navigation";
import NewItemForm from "@/components/organisms/NewItemForm";
import { buildStocktakingListUrl } from "@/utils/inventoryNavigation";

/** Inventura list / scan / unknown QR → Nový */
export default function StocktakingNewItemPage() {
  const params = useParams();
  const stocktakingId = Number.parseInt(String(params?.id ?? ""), 10);

  if (!Number.isFinite(stocktakingId) || stocktakingId <= 0) {
    return (
      <main className="relative min-h-screen flex flex-col items-center p-4">
        <p style={{ color: "#FF6262", fontWeight: 600 }}>
          Neplatná inventura (chybí nebo je neplatné ID).
        </p>
      </main>
    );
  }

  return (
    <NewItemForm
      stocktakingId={stocktakingId}
      defaultReturnTo={buildStocktakingListUrl(stocktakingId)}
    />
  );
}
