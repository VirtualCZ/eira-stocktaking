export default function CardContainer({ children, className = "" }) {
    return (
        <div className={`rounded-2xl bg-[#f0f1f3] p-4 flex flex-col gap-[4px] ${className}`}>
            {children}
        </div>
    );
}