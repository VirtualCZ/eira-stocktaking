import { useState, useEffect, useCallback } from "react";
import { getAuthHeadersSafe, isAuthenticated } from "@/utils/token";

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

export function getAttachmentDownloadUrl(attachId) {
  return `/api/attachments/${attachId}`;
}

export function useItemAttachments(rmId) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);

  const fetchAttachments = useCallback(() => {
    if (!rmId || !isAuthenticated()) {
      setAttachments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/objects/${rmId}/attachments`, {
      method: "GET",
      headers: getAuthHeadersSafe(),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAttachments(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [rmId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const uploadAttachment = useCallback(
    async (
      { fileName, mimeType, description, data },
      { skipRefetch = false, rmId: rmIdOverride } = {}
    ) => {
      const targetRmId = rmIdOverride ?? rmId;
      if (!targetRmId) throw new Error("Chybí ID položky");
      setMutating(true);
      try {
        const res = await fetch(`/api/objects/${targetRmId}/attachments`, {
          method: "POST",
          headers: {
            ...getAuthHeadersSafe(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName, mimeType, description, data }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Nahrání selhalo (HTTP ${res.status})`);
        }
        const created = await res.json();
        if (!skipRefetch) await fetchAttachments();
        return created;
      } finally {
        setMutating(false);
      }
    },
    [rmId, fetchAttachments]
  );

  const deleteAttachment = useCallback(
    async (attachId, { skipRefetch = false, rmId: rmIdOverride } = {}) => {
      const targetRmId = rmIdOverride ?? rmId;
      if (!targetRmId || !attachId) return;
      setMutating(true);
      try {
        const res = await fetch("/api/attachments/delete", {
          method: "POST",
          headers: {
            ...getAuthHeadersSafe(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attachId, rmId: targetRmId }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Smazání selhalo (HTTP ${res.status})`);
        }
        if (!skipRefetch) await fetchAttachments();
      } finally {
        setMutating(false);
      }
    },
    [rmId, fetchAttachments]
  );

  const fetchAttachmentBlob = useCallback(async (attachId) => {
    const res = await fetch(getAttachmentDownloadUrl(attachId), {
      method: "GET",
      headers: getAuthHeadersSafe(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Stažení selhalo (HTTP ${res.status})`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    let fileName = null;
    const match = disposition.match(/filename="([^"]+)"/i);
    if (match) fileName = match[1];
    return { blob, fileName, mimeType: blob.type };
  }, []);

  return {
    attachments,
    loading,
    error,
    mutating,
    refetch: fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    fetchAttachmentBlob,
    maxBytes: MAX_ATTACHMENT_BYTES,
  };
}
