export function formatFileSize(bytes) {
  if (bytes == null || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function attachmentMimeIcon(mimeType) {
  const m = (mimeType || "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m === "application/pdf") return "picture_as_pdf";
  if (m.includes("word") || m.includes("document")) return "description";
  if (m.includes("sheet") || m.includes("excel")) return "table_chart";
  if (m.startsWith("text/")) return "article";
  return "attach_file";
}

export function isPreviewableMime(mimeType) {
  const m = (mimeType || "").toLowerCase();
  return m.startsWith("image/") || m === "application/pdf";
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Soubor se nepodařilo přečíst."));
    reader.readAsDataURL(file);
  });
}
