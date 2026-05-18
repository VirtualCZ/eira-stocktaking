import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import CardContainer from "@/components/atoms/CardContainer";
import CenteredModal from "@/components/molecules/CenteredModal";
import { useItemAttachments } from "@/hooks/useItemAttachments";
import { processImageForEira } from "@/utils/processImageForEira";
import {
  formatFileSize,
  attachmentMimeIcon,
  isPreviewableMime,
  fileToDataUrl,
} from "@/utils/attachmentUtils";

const ACCEPT_TYPES =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain";

function isImageFile(file) {
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  const n = (file.name || "").toLowerCase();
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(n);
}

function createLocalId() {
  return `pending-${crypto.randomUUID()}`;
}

const ItemAttachmentsSection = forwardRef(function ItemAttachmentsSection(
  { rmId, editMode = false },
  ref
) {
  const fileInputRef = useRef(null);
  const blobUrlsRef = useRef([]);
  const {
    attachments,
    loading,
    error,
    mutating,
    uploadAttachment,
    deleteAttachment,
    fetchAttachmentBlob,
    refetch,
    maxBytes,
  } = useItemAttachments(rmId);

  const [pendingUploads, setPendingUploads] = useState([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState(() => new Set());
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "" });
  const [preview, setPreview] = useState({ open: false, url: null, fileName: "", mimeType: "" });
  const [loadingAttachId, setLoadingAttachId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stagingFiles, setStagingFiles] = useState(false);

  const discardPending = useCallback(() => {
    setPendingUploads([]);
    setPendingDeleteIds(new Set());
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!editMode) {
      discardPending();
    }
  }, [editMode, discardPending]);

  useEffect(() => {
    setPendingUploads([]);
    setPendingDeleteIds(new Set());
  }, [rmId]);

  const commitPending = useCallback(async () => {
    const toUpload = [...pendingUploads];
    const toDelete = [...pendingDeleteIds];
    if (toUpload.length === 0 && toDelete.length === 0) {
      return;
    }
    const batchOpts = { skipRefetch: true };
    for (const attachId of toDelete) {
      await deleteAttachment(attachId, batchOpts);
    }
    for (const payload of toUpload) {
      await uploadAttachment(
        {
          fileName: payload.fileName,
          mimeType: payload.mimeType,
          description: payload.description,
          data: payload.data,
        },
        batchOpts
      );
    }
    setPendingUploads([]);
    setPendingDeleteIds(new Set());
    await refetch();
  }, [pendingUploads, pendingDeleteIds, deleteAttachment, uploadAttachment, refetch]);

  const hasPendingChanges = useCallback(
    () => pendingUploads.length > 0 || pendingDeleteIds.size > 0,
    [pendingUploads, pendingDeleteIds]
  );

  useImperativeHandle(ref, () => ({ commitPending, discardPending }), [commitPending, discardPending]);

  const visibleAttachments = useMemo(() => {
    const kept = attachments
      .filter((a) => !pendingDeleteIds.has(a.id))
      .map((a) => ({ ...a, pending: false }));
    const pending = pendingUploads.map((p) => ({
      id: p.localId,
      fileName: p.fileName,
      mimeType: p.mimeType,
      size: p.size,
      updatedAt: null,
      pending: true,
      data: p.data,
    }));
    return [...pending, ...kept];
  }, [attachments, pendingDeleteIds, pendingUploads]);

  const trackBlobUrl = useCallback((url) => {
    if (url) blobUrlsRef.current.push(url);
    return url;
  }, []);

  const revokeAllBlobUrls = useCallback(() => {
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
  }, []);

  useEffect(() => () => revokeAllBlobUrls(), [revokeAllBlobUrls]);

  const closePreview = useCallback(() => {
    setPreview({ open: false, url: null, fileName: "", mimeType: "" });
    revokeAllBlobUrls();
  }, [revokeAllBlobUrls]);

  const showError = (title, message) => {
    setMessageModal({ open: true, title, message });
  };

  const handleOpenAttachment = async (att) => {
    if (loadingAttachId || stagingFiles) return;
    setLoadingAttachId(att.id);
    try {
      let effectiveMime = att.mimeType;
      let url;
      let fileName = att.fileName;

      if (att.pending && att.data) {
        effectiveMime = att.mimeType || "application/octet-stream";
        url = att.data.startsWith("data:") ? att.data : trackBlobUrl(URL.createObjectURL(new Blob([], { type: effectiveMime })));
      } else {
        const result = await fetchAttachmentBlob(att.id);
        effectiveMime = result.mimeType || att.mimeType || result.blob.type;
        fileName = result.fileName || att.fileName;
        url = trackBlobUrl(URL.createObjectURL(result.blob));
      }

      if (isPreviewableMime(effectiveMime)) {
        setPreview({
          open: true,
          url,
          fileName,
          mimeType: effectiveMime,
        });
      } else if (att.pending && att.data?.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = att.data;
        a.download = fileName || "attachment";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "attachment";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (!att.pending) {
          setTimeout(() => {
            URL.revokeObjectURL(url);
            blobUrlsRef.current = blobUrlsRef.current.filter((u) => u !== url);
          }, 500);
        }
      }
    } catch (e) {
      showError("Chyba", e.message || "Soubor se nepodařilo načíst.");
    } finally {
      setLoadingAttachId(null);
    }
  };

  const prepareFilePayload = async (file) => {
    if (file.size > maxBytes) {
      throw new Error(`Soubor je příliš velký (max ${formatFileSize(maxBytes)}).`);
    }
    if (isImageFile(file)) {
      const dataUrl = await processImageForEira(file);
      return {
        fileName: file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        mimeType: "image/jpeg",
        data: dataUrl,
        size: file.size,
      };
    }
    const dataUrl = await fileToDataUrl(file);
    return {
      fileName: file.name,
      mimeType: file.type || undefined,
      data: dataUrl,
      size: file.size,
    };
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setStagingFiles(true);
    try {
      for (const file of files) {
        const payload = await prepareFilePayload(file);
        setPendingUploads((prev) => [
          ...prev,
          {
            localId: createLocalId(),
            fileName: payload.fileName,
            mimeType: payload.mimeType,
            data: payload.data,
            size: payload.size,
          },
        ]);
      }
    } catch (err) {
      showError("Příprava souboru selhala", err.message || "Soubor se nepodařilo přidat.");
    } finally {
      setStagingFiles(false);
    }
  };

  const handleDeleteConfirm = (att) => {
    if (att.pending) {
      setPendingUploads((prev) => prev.filter((p) => p.localId !== att.id));
      setDeleteConfirm(null);
      return;
    }
    setPendingDeleteIds((prev) => new Set(prev).add(att.id));
    setDeleteConfirm(null);
  };

  const busy = mutating || stagingFiles;
  const showPendingHint = editMode && hasPendingChanges();

  if (!rmId) return null;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AttachmentsHeader
          editMode={editMode}
          busy={busy}
          onAdd={() => fileInputRef.current?.click()}
        />
        {showPendingHint && (
          <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>
            Změny příloh se uloží tlačítkem Uložit
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          multiple
          style={{ display: "none" }}
          onChange={handleFileSelect}
          disabled={busy}
        />

        {loading && visibleAttachments.length === 0 && (
          <div style={{ fontSize: 12, color: "#535353" }}>Načítání příloh…</div>
        )}

        {error && !loading && (
          <div style={{ fontSize: 12, color: "#c62828" }}>Chyba načtení příloh</div>
        )}

        {!loading && !error && visibleAttachments.length === 0 && (
          <div style={{ fontSize: 12, color: "#535353", fontStyle: "italic" }}>Žádné přílohy</div>
        )}

        {visibleAttachments.length > 0 && (
          <CardContainer className="gap-0" style={{ padding: 0, overflow: "hidden" }}>
            {visibleAttachments.map((att, index) => (
              <AttachmentRow
                key={att.id}
                att={att}
                isLast={index === visibleAttachments.length - 1}
                editMode={editMode}
                loading={loadingAttachId === att.id}
                disabled={busy}
                onOpen={() => handleOpenAttachment(att)}
                onDelete={() => setDeleteConfirm(att)}
              />
            ))}
          </CardContainer>
        )}
      </div>

      <CenteredModal
        isOpen={preview.open}
        onClose={closePreview}
        title={preview.fileName}
        width="95vw"
        contentStyle={{ maxHeight: "85vh", overflow: "auto" }}
      >
        {preview.mimeType?.startsWith("image/") && preview.url && (
          <img
            src={preview.url}
            alt={preview.fileName}
            style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain", display: "block", margin: "0 auto" }}
          />
        )}
        {preview.mimeType === "application/pdf" && preview.url && (
          <iframe
            src={preview.url}
            title={preview.fileName}
            style={{ width: "100%", height: "70vh", border: "none" }}
          />
        )}
      </CenteredModal>

      <CenteredModal
        isOpen={!!deleteConfirm}
        onClose={() => !busy && setDeleteConfirm(null)}
        title="Odebrat přílohu?"
        width="90vw"
      >
        <p style={{ fontSize: 14, marginBottom: 16 }}>
          {deleteConfirm?.pending
            ? `Odebrat „${deleteConfirm?.fileName}" ze seznamu? (ještě nebylo nahráno)`
            : `Označit „${deleteConfirm?.fileName}" ke smazání po uložení?`}
        </p>
        <DeleteActions
          busy={busy}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteConfirm(deleteConfirm)}
        />
      </CenteredModal>

      <CenteredModal
        isOpen={messageModal.open}
        onClose={() => setMessageModal((m) => ({ ...m, open: false }))}
        title={messageModal.title}
        width="90vw"
      >
        <p style={{ fontSize: 14 }}>{messageModal.message}</p>
      </CenteredModal>
    </>
  );
});

export default ItemAttachmentsSection;

function AttachmentsHeader({ editMode, busy, onAdd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 500, fontSize: 12, color: "#535353" }}>Přílohy</span>
      {editMode && (
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            color: "#000",
            fontSize: 12,
            fontWeight: 600,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.5 : 1,
          }}
        >
          <span className="material-icons-round" style={{ fontSize: 18 }}>add</span>
          Přidat
        </button>
      )}
    </div>
  );
}

function DeleteActions({ busy, onCancel, onConfirm }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid #ccc", background: "#fff" }}
      >
        Zrušit
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: "#FF6262", color: "#fff" }}
      >
        Potvrdit
      </button>
    </div>
  );
}

function AttachmentRow({ att, isLast, editMode, loading, disabled, onOpen, onDelete }) {
  const subtitle = [
    att.pending ? "čeká na uložení" : null,
    formatFileSize(att.size),
    att.updatedAt,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
        cursor: loading || disabled ? "wait" : "pointer",
        opacity: loading ? 0.6 : att.pending ? 0.85 : 1,
      }}
      onClick={() => !disabled && onOpen()}
    >
      <span className="material-icons-round" style={{ fontSize: 22, color: "#535353" }}>
        {attachmentMimeIcon(att.mimeType)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#000",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {att.fileName}
        </div>
        <div style={{ fontSize: 11, color: att.pending ? "#b8860b" : "#888" }}>{subtitle}</div>
      </div>
      {editMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onDelete();
          }}
          disabled={disabled}
          style={{
            background: "none",
            border: "none",
            padding: 4,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title="Odebrat"
        >
          <span className="material-icons-round" style={{ fontSize: 20, color: "#FF6262" }}>
            delete
          </span>
        </button>
      )}
    </div>
  );
}
