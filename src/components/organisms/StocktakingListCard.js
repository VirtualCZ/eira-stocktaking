import React from "react";
import Link from "next/link";
import CardContainer from "@/components/atoms/CardContainer";
import CardItemName from "@/components/atoms/CardItemName";
import CardItemDescription from "@/components/atoms/CardItemDescription";
import CardItemDate from "@/components/atoms/CardItemDate";

export default function StocktakingListCard({ operation, href, onClick }) {
  return (
    <Link
      href={href}
      style={{ textDecoration: "none" }}
      onClick={onClick}
    >
      <CardContainer className="gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardItemName>{operation.name || `Inventura #${operation.id}`}</CardItemName>
            <span className="material-icons-round" style={{ fontSize: 18, color: '#000' }}>arrow_forward_ios</span>
          </div>
          <CardItemDescription>{operation.note}</CardItemDescription>
          {operation.stateLabel ? (
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2ecc40", marginTop: 4 }}>
              {operation.stateLabel}
            </div>
          ) : null}
        </div>
        <CardItemDate>Datum: {operation.date}</CardItemDate>
      </CardContainer>
    </Link>
  );
} 