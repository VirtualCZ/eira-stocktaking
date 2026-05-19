"use client";

import { useParams } from "next/navigation";
import LinkItemForm from "@/components/organisms/LinkItemForm";
import { buildStocktakingListUrl } from "@/utils/inventoryNavigation";

/** Inventura list / scan: propojit existující → Nový */
export default function StocktakingLinkItemPage() {
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
    <LinkItemForm
      stocktakingId={stocktakingId}
      defaultReturnTo={buildStocktakingListUrl(stocktakingId)}
    />
  );
}
