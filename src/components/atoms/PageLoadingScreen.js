export default function PageLoadingScreen({ message = "Načítání..." }) {
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
      <div style={{ fontSize: "1rem", color: "#666" }}>{message}</div>
    </div>
  );
}
