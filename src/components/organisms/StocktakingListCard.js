import React from "react";
import Link from "next/link";
import CardContainer from "../CardContainer";
import CardItemName from "../molecules/CardItemName";
import CardItemDescription from "../molecules/CardItemDescription";
import CardItemDate from "../molecules/CardItemDate";

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
        </div>
        <CardItemDate>Datum: {operation.date}</CardItemDate>
      </CardContainer>
    </Link>
  );
} 