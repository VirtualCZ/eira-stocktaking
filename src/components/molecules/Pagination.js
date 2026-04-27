"use client";

import React, { useMemo, useCallback } from "react";
import { paginationPageList } from "@/utils/paginationPages";
import { feedTotalApiPages } from "@/utils/feedPagination";

/** Shared with page numbers + arrows + append (border-box so border matches visual size). */
const pillBase = {
    boxSizing: "border-box",
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    fontWeight: 600,
    background: "#fff",
    color: "#222",
};

function PageArrow({ direction, disabled, onClick, ariaLabel }) {
    const icon = direction === "back" ? "arrow_back_ios_new" : "arrow_forward_ios";
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            style={{
                ...pillBase,
                width: 36,
                minWidth: 36,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
            }}
        >
            <span className="material-icons-round" style={{ fontSize: 16, lineHeight: 1 }}>
                {icon}
            </span>
        </button>
    );
}

function PageNumberStrip({ pageList, active1Based, disabled, onSelect1Based, scrollTop }) {
    return (
        <nav
            aria-label="Stránkování"
            style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", alignItems: "center" }}
        >
            {pageList.map((entry, idx) =>
                entry === "ellipsis" ? (
                    <span key={`gap-${idx}`} style={{ color: "#888", padding: "0 4px" }}>
                        …
                    </span>
                ) : (
                    <button
                        key={entry}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            onSelect1Based(entry);
                            scrollTop();
                        }}
                        style={{
                            ...pillBase,
                            cursor: disabled ? "wait" : "pointer",
                            background: entry === active1Based ? "#282828" : "#fff",
                            color: entry === active1Based ? "#fff" : "#222",
                            borderColor: entry === active1Based ? "#282828" : "#ccc",
                        }}
                    >
                        {entry}
                    </button>
                )
            )}
        </nav>
    );
}

function PaginationToolbar({ children, marginTop = 10 }) {
    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop,
                paddingBottom: 4,
            }}
        >
            {children}
        </div>
    );
}

/** Prev / strip / next. `currentPage` is 0-based. */
function NavPagination({ currentPage, totalPages, onPageChange, loading = false }) {
    const tp = Math.max(1, totalPages);
    const current1Based = Math.min(Math.max(1, currentPage + 1), tp);
    const pageList = useMemo(
        () => paginationPageList(current1Based, tp),
        [current1Based, tp]
    );

    const scrollTop = useCallback(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const onSelect1Based = useCallback(
        (page1Based) => {
            onPageChange(page1Based - 1);
        },
        [onPageChange]
    );

    const busy = Boolean(loading);

    return (
        <PaginationToolbar>
            <PageArrow
                direction="back"
                disabled={currentPage <= 0 || busy}
                ariaLabel="Předchozí stránka"
                onClick={() => {
                    if (currentPage <= 0 || busy) return;
                    onPageChange(currentPage - 1);
                    scrollTop();
                }}
            />
            <PageNumberStrip
                pageList={pageList}
                active1Based={current1Based}
                disabled={busy}
                onSelect1Based={onSelect1Based}
                scrollTop={scrollTop}
            />
            <PageArrow
                direction="forward"
                disabled={currentPage >= tp - 1 || busy}
                ariaLabel="Další stránka"
                onClick={() => {
                    if (currentPage >= tp - 1 || busy) return;
                    onPageChange(currentPage + 1);
                    scrollTop();
                }}
            />
        </PaginationToolbar>
    );
}

/** Append row (optional), then prev · pages · next. */
function FeedPagination({
    total,
    pageSize,
    highlightPage1Based,
    onPageSelect1Based,
    onAppendNext,
    canAppendMore,
    appendNextLabel,
    loading = false,
}) {
    const totalPages = useMemo(() => feedTotalApiPages(total, pageSize), [total, pageSize]);
    const current1Based = Math.min(Math.max(1, highlightPage1Based), totalPages);
    const pageList = useMemo(
        () => paginationPageList(current1Based, totalPages),
        [current1Based, totalPages]
    );

    const scrollTop = useCallback(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const busy = Boolean(loading);

    return (
        <>
            {canAppendMore ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 10,
                        marginBottom: 2,
                    }}
                >
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAppendNext?.()}
                        style={{
                            ...pillBase,
                            height: 36,
                            minHeight: 36,
                            padding: "0 12px",
                            maxWidth: "100%",
                            cursor: busy ? "wait" : "pointer",
                            opacity: busy ? 0.65 : 1,
                            fontSize: 13,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {appendNextLabel}
                    </button>
                </div>
            ) : null}
            <PaginationToolbar marginTop={canAppendMore ? 6 : 10}>
                <PageArrow
                    direction="back"
                    disabled={current1Based <= 1 || busy}
                    ariaLabel="Předchozí stránka"
                    onClick={() => {
                        if (current1Based <= 1 || busy) return;
                        onPageSelect1Based(current1Based - 1);
                        scrollTop();
                    }}
                />
                <PageNumberStrip
                    pageList={pageList}
                    active1Based={current1Based}
                    disabled={busy}
                    onSelect1Based={onPageSelect1Based}
                    scrollTop={scrollTop}
                />
                <PageArrow
                    direction="forward"
                    disabled={current1Based >= totalPages || busy}
                    ariaLabel="Další stránka"
                    onClick={() => {
                        if (current1Based >= totalPages || busy) return;
                        onPageSelect1Based(current1Based + 1);
                        scrollTop();
                    }}
                />
            </PaginationToolbar>
        </>
    );
}

/**
 * @param {"nav"|"feed"} variant — `nav`: inventury list; `feed`: base-items + stocktaking detail.
 */
export function Pagination(props) {
    const { variant = "nav", ...rest } = props;
    if (variant === "feed") {
        return <FeedPagination {...rest} />;
    }
    return <NavPagination {...rest} />;
}
