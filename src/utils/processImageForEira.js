/**
 * Normalize camera / gallery uploads for EIRA inventory attach API.
 *
 * Backend (eiraservice InventoryService) persists only: image/jpeg, image/png,
 * image/gif, image/webp — anything else must be converted client-side.
 *
 * Output: JPEG data URL, longest edge at most {@link MAX_EDGE_PX} (may shrink further
 * if the file stays above {@link TARGET_MAX_JPEG_BYTES} even at {@link MIN_JPEG_QUALITY}).
 */

export const MAX_EDGE_PX = 2000;
/** Upper bound for JPEG encoder quality when searching for a smaller file. */
export const JPEG_QUALITY = 0.88;
/** Decoded JPEG size target (bytes). Quality is reduced until under this, then edge if needed. */
export const TARGET_MAX_JPEG_BYTES = 380 * 1024;
export const MIN_JPEG_QUALITY = 0.42;
/** Do not shrink the long edge below this when chasing the byte budget. */
export const MIN_EDGE_PX = 768;
/** MIME types Eira accepts on insert (see InventoryService.updateInventoryObject). */
export const EIRA_ATTACH_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function isHeicLike(file) {
  const t = (file.type || "").toLowerCase();
  if (t === "image/heic" || t === "image/heif") return true;
  const n = (file.name || "").toLowerCase();
  return n.endsWith(".heic") || n.endsWith(".heif");
}

async function heicToJpegBlob(file) {
  const mod = await import("heic2any");
  const heic2any = mod.default;
  const out = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: JPEG_QUALITY,
  });
  return Array.isArray(out) ? out[0] : out;
}

function loadHtmlImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Obrázek se nepodařilo načíst (nepodporovaný formát nebo poškozený soubor)."));
    };
    img.src = url;
  });
}

function scaleDimensions(width, height, maxEdge) {
  if (!width || !height) return { w: maxEdge, h: maxEdge };
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    w: Math.max(1, Math.round(width * scale)),
    h: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Export obrázku selhal."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Čtení exportu selhalo."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Highest JPEG quality in [qMin, qMax] such that encoded size <= targetBytes,
 * or the smallest blob at qMin if the budget cannot be met at this resolution.
 */
async function jpegBlobUnderByteBudget(canvas, targetBytes, qMin, qMax) {
  const bMax = await canvasToJpegBlob(canvas, qMax);
  if (bMax.size <= targetBytes) return bMax;
  const bMin = await canvasToJpegBlob(canvas, qMin);
  if (bMin.size > targetBytes) return bMin;

  let lo = qMin;
  let hi = qMax;
  for (let n = 0; n < 14 && hi - lo > 0.012; n++) {
    const mid = (lo + hi) / 2;
    const b = await canvasToJpegBlob(canvas, mid);
    if (b.size <= targetBytes) lo = mid;
    else hi = mid;
  }
  return canvasToJpegBlob(canvas, lo);
}

function paintImageOnCanvas(img, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas není k dispozici.");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

/**
 * @param {File} file
 * @param {{
 *   maxEdge?: number,
 *   targetMaxBytes?: number,
 *   minQuality?: number,
 *   maxQuality?: number,
 * }} [opts]
 * @returns {Promise<string>} data:image/jpeg;base64,...
 */
export async function processImageForEira(file, opts = {}) {
  if (!(file instanceof File)) {
    throw new Error("Neplatný soubor.");
  }
  const targetBytes = opts.targetMaxBytes ?? TARGET_MAX_JPEG_BYTES;
  const qMin = opts.minQuality ?? MIN_JPEG_QUALITY;
  const qMax = opts.maxQuality ?? JPEG_QUALITY;
  let maxEdge = opts.maxEdge ?? MAX_EDGE_PX;

  let blob = file;
  if (isHeicLike(file)) {
    try {
      blob = await heicToJpegBlob(file);
    } catch (e) {
      throw new Error(
        "Konverze HEIC/HEIF selhala. Zkuste exportovat fotku jako JPEG v telefonu, nebo jiný prohlížeč."
      );
    }
  }

  const img = await loadHtmlImageFromBlob(blob);

  let prevWh = null;
  while (true) {
    const { w, h } = scaleDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxEdge
    );
    const canvas = paintImageOnCanvas(img, w, h);
    const outBlob = await jpegBlobUnderByteBudget(canvas, targetBytes, qMin, qMax);
    if (outBlob.size <= targetBytes || maxEdge <= MIN_EDGE_PX) {
      return blobToDataUrl(outBlob);
    }
    const wh = `${w}x${h}`;
    if (wh === prevWh) {
      return blobToDataUrl(outBlob);
    }
    prevWh = wh;
    maxEdge = Math.max(MIN_EDGE_PX, Math.round(maxEdge * 0.85));
  }
}
