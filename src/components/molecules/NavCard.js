import Link from "next/link";

export function NavButton({
    text,
    icon = null,
    size = "small", // "big" or "small"
    variant = "light", // "light" or "dark"
    onClick
}) {
    // Color logic
    const isDark = variant === "dark";
    const bgColor = isDark ? "#000" : "#f0f1f3";
    const textColor = isDark ? "#fff" : "#000";
    // Big variant
    if (size === "big") {
        return (
            <button
                onClick={onClick}
                style={{
                    background: bgColor,
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    textDecoration: "none",
                    color: textColor,
                    flex: "1"
                }}
            >
                {/* Icon row */}
                {icon && (
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", minHeight: 32 }}>
                        <span className="material-icons-round" style={{ fontSize: 32, color: textColor }}>{icon}</span>
                    </div>
                )}
                {/* Text + Arrow row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        minHeight: 32,
                        marginTop: icon ? 32 : 0
                    }}
                >
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{text}</span>
                    <span className="material-icons-round" style={{ fontSize: 14, color: textColor }}>arrow_forward_ios</span>
                </div>
            </button>
        );
    }
    // Small variant
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 16,
                background: bgColor,
                textDecoration: "none",
                color: textColor,
            }}
        >
            <span style={{ fontWeight: 600, fontSize: 12 }}>{text}</span>
            <span className="material-icons-round" style={{ fontSize: 14, color: textColor }}>arrow_forward_ios</span>
        </button>
    );
}

export function NavLink({
    text,
    href = "#",
    icon = null,
    size = "small", // "big" or "small"
    variant = "light" // "light" or "dark"
}) {
    // Color logic
    const isDark = variant === "dark";
    const bgColor = isDark ? "#000" : "#f0f1f3";
    const textColor = isDark ? "#fff" : "#000";
    // Big variant
    if (size === "big") {
        return (
            <Link
                href={href}
                style={{
                    background: bgColor,
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    textDecoration: "none",
                    color: textColor,
                    flex: "1"
                }}
            >
                {/* Icon row */}
                {icon && (
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", minHeight: 32 }}>
                        <span className="material-icons-round" style={{ fontSize: 32, color: textColor }}>{icon}</span>
                    </div>
                )}
                {/* Text + Arrow row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        minHeight: 32,
                        marginTop: icon ? 32 : 0
                    }}
                >
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{text}</span>
                    <span className="material-icons-round" style={{ fontSize: 14, color: textColor }}>arrow_forward_ios</span>
                </div>
            </Link>
        );
    }
    // Small variant
    return (
        <Link
            href={href}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 16,
                background: bgColor,
                textDecoration: "none",
                color: textColor,
            }}
        >
            <span style={{ fontWeight: 600, fontSize: 12 }}>{text}</span>
            <span className="material-icons-round" style={{ fontSize: 14, color: textColor }}>arrow_forward_ios</span>
        </Link>
    );
}