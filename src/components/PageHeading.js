import Link from "next/link";

export default function PageHeading({ heading, route }) {
    return (
        <div className="flex items-center mb-4">
            <Link href={route} className="flex items-center">
                {route === "/" ? (
                    <span className="material-icons-round" style={{ fontSize: "1.5rem" }}>
                        home
                    </span>
                ) : (
                    <span className="material-icons-round" style={{ fontSize: "1.5rem" }}>
                        arrow_back
                    </span>
                )}
            </Link>
            <div className="w-px h-6 bg-black mx-2" />
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                {heading}
            </h1>
        </div>
    );
}