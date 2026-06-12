"use client";

import CenteredModal from "@/components/molecules/CenteredModal";

export default function ActionLoadingModal({
  isOpen,
  message = "Probíhá akce...",
}) {
  return (
    <CenteredModal
      isOpen={isOpen}
      title={message}
      disableClickAway
      hideCloseButton
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "0.5rem 0",
        }}
      >
        <span style={{ fontSize: 14, color: "#535353" }}>{message}</span>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
      </div>
    </CenteredModal>
  );
}
