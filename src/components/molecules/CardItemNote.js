"use client";
import React from "react";

export default function CardItemNote({ children, showLabel = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#535353' }}>
      {showLabel && <div style={{ fontWeight: 500, fontSize: 12 }}>Poznámka:</div>}
      <div style={{ fontStyle: 'italic', fontSize: 12 }}>{children}</div>
    </div>
  );
} 