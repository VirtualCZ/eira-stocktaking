"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelectedInventura } from "@/hooks/useSelectedInventura";
import {
  CLOSED_INVENTURA_MESSAGE,
  isInventuraActive,
} from "@/utils/inventuraEventStates";
import { getInventuraRouteRequirement } from "@/utils/inventuraRoutePolicy";

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f1f3",
      }}
    >
      <div style={{ fontSize: "1rem", color: "#666" }}>Loading...</div>
    </div>
  );
}

function BlockScreen({ title, message }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "2rem",
        textAlign: "center",
        background: "#f0f1f3",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 40 }}>🔒</div>
      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#282828" }}>{title}</div>
      <p style={{ color: "#535353", fontSize: 14, lineHeight: 1.5, maxWidth: 360, margin: 0 }}>
        {message}
      </p>
      <Link
        href="/stocktakingList"
        style={{
          marginTop: 8,
          padding: "12px 20px",
          borderRadius: 12,
          background: "#282828",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Seznam inventur
      </Link>
    </div>
  );
}

/**
 * App-wide guard (like AuthGuard): inventura workflows need Zahájený selection.
 * Home and /stocktakingList stay open so the user can pick a new inventura.
 */
export default function InventuraGuard({ children }) {
  const pathname = usePathname();
  const { selectedInventura, ready } = useSelectedInventura();
  const requirement = getInventuraRouteRequirement(pathname);

  if (!requirement.required) {
    return children;
  }

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!selectedInventura?.id) {
    return (
      <BlockScreen
        title="Inventura není vybrána"
        message="Nejprve vyberte aktivní inventuru ve stavu Zahájený v seznamu inventur."
      />
    );
  }

  if (!isInventuraActive(selectedInventura)) {
    return (
      <BlockScreen
        title="Inventura není aktivní"
        message={CLOSED_INVENTURA_MESSAGE}
      />
    );
  }

  if (
    requirement.stocktakingId != null &&
    Number(selectedInventura.id) !== Number(requirement.stocktakingId)
  ) {
    return (
      <BlockScreen
        title="Jiná inventura je vybrána"
        message="Tato stránka patří k jiné inventuře. Vyberte správnou inventuru v seznamu."
      />
    );
  }

  return children;
}
