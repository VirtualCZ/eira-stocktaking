export default function CardContainer({ children, className = "", style = {} }) {
    return (
        <div className={`rounded-2xl bg-[#f0f1f3] p-4 flex flex-col ${className}`} style={style}>
            {children}
        </div>
    );
}