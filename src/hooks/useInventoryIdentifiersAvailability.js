import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getAuthHeadersSafe } from "@/utils/token";

async function fetchIdentifiersAvailability(code) {
  const value = String(code ?? "").trim();
  if (!value) {
    return {
      available: true,
      invNumberAvailable: true,
      qrAvailable: true,
    };
  }

  const res = await fetch("/api/objects/qr-available", {
    method: "POST",
    headers: getAuthHeadersSafe(),
    body: JSON.stringify({ invNumber: value, qr: value }),
  });

  if (!res.ok) {
    throw new Error(`Identifier availability check failed (${res.status})`);
  }

  return res.json();
}

export function getIdentifierValidationError({ code, result }) {
  const value = String(code ?? "").trim();
  if (!value || !result) return null;
  if (!result.invNumberAvailable || !result.qrAvailable) {
    return "Toto inventurizační číslo / QR je již použito. Zadejte jiné.";
  }
  return null;
}

function computeIdentifierValid({ code, invNumberAvailable, qrAvailable, checking, error }) {
  const value = String(code ?? "").trim();
  if (!value) return true;
  if (checking || error) return false;
  if (invNumberAvailable !== true || qrAvailable !== true) return false;
  return true;
}

/** Imperative check on save. */
export function useInventoryIdentifiersCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async (code) => {
    setChecking(true);
    setError(null);
    try {
      return await fetchIdentifiersAvailability(code);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkAvailability, checking, error };
}

/**
 * Debounced availability for inventurizační číslo / QR (same value → rm_inv_number + RMINV_QR).
 */
export function useInventoryIdentifiersAvailability(
  code,
  { enabled = true, debounceMs = 400 } = {}
) {
  const [invNumberAvailable, setInvNumberAvailable] = useState(null);
  const [qrAvailable, setQrAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const trimmed = String(code ?? "").trim();

  useEffect(() => {
    if (!enabled) {
      setInvNumberAvailable(null);
      setQrAvailable(null);
      setChecking(false);
      setError(null);
      return;
    }

    if (!trimmed) {
      setInvNumberAvailable(null);
      setQrAvailable(null);
      setChecking(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setChecking(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const result = await fetchIdentifiersAvailability(trimmed);
        if (requestId !== requestIdRef.current) return;
        setInvNumberAvailable(Boolean(result?.invNumberAvailable));
        setQrAvailable(Boolean(result?.qrAvailable));
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err);
        setInvNumberAvailable(null);
        setQrAvailable(null);
      } finally {
        if (requestId === requestIdRef.current) {
          setChecking(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [trimmed, enabled, debounceMs]);

  const valid = useMemo(
    () =>
      computeIdentifierValid({
        code: trimmed,
        invNumberAvailable,
        qrAvailable,
        checking,
        error,
      }),
    [trimmed, invNumberAvailable, qrAvailable, checking, error]
  );

  const available =
    invNumberAvailable === true && qrAvailable === true;

  return {
    available: trimmed ? available : null,
    valid,
    checking,
    error,
  };
}
