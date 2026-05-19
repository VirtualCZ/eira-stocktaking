import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getAuthHeadersSafe } from "@/utils/token";

async function fetchIdentifiersAvailability({ invNumber, qr } = {}) {
  const inv = String(invNumber ?? "").trim();
  const q = String(qr ?? "").trim();
  if (!inv && !q) {
    return {
      available: true,
      invNumberAvailable: true,
      qrAvailable: true,
    };
  }

  const res = await fetch("/api/objects/qr-available", {
    method: "POST",
    headers: getAuthHeadersSafe(),
    body: JSON.stringify({
      ...(inv ? { invNumber: inv } : {}),
      ...(q ? { qr: q } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Identifier availability check failed (${res.status})`);
  }

  return res.json();
}

export function getIdentifierValidationError({ invNumber, qr, result }) {
  const inv = String(invNumber ?? "").trim();
  const q = String(qr ?? "").trim();

  if (inv && result && !result.invNumberAvailable) {
    return "Toto inventurizační číslo je již použito. Zadejte jiné číslo.";
  }
  if (q && result && !result.qrAvailable) {
    return "Tento QR kód je již použit v inventuře. Zadejte jiný kód.";
  }
  return null;
}

function computeIdentifiersValid({
  invNumber,
  qr,
  invNumberAvailable,
  qrAvailable,
  checking,
  error,
}) {
  const inv = String(invNumber ?? "").trim();
  const q = String(qr ?? "").trim();
  if (!inv && !q) return true;
  if (checking || error) return false;
  if (inv && invNumberAvailable !== true) return false;
  if (q && qrAvailable !== true) return false;
  return true;
}

/** Imperative check on save. */
export function useInventoryIdentifiersCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async ({ invNumber, qr } = {}) => {
    setChecking(true);
    setError(null);
    try {
      return await fetchIdentifiersAvailability({ invNumber, qr });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkAvailability, checking, error };
}

/** Debounced inventurizační číslo + QR availability. */
export function useInventoryIdentifiersAvailability(
  { invNumber, qr } = {},
  { enabled = true, debounceMs = 400 } = {}
) {
  const [invNumberAvailable, setInvNumberAvailable] = useState(null);
  const [qrAvailable, setQrAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const invTrimmed = String(invNumber ?? "").trim();
  const qrTrimmed = String(qr ?? "").trim();

  useEffect(() => {
    if (!enabled) {
      setInvNumberAvailable(null);
      setQrAvailable(null);
      setChecking(false);
      setError(null);
      return;
    }

    if (!invTrimmed && !qrTrimmed) {
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
        const result = await fetchIdentifiersAvailability({
          invNumber: invTrimmed,
          qr: qrTrimmed,
        });
        if (requestId !== requestIdRef.current) return;
        setInvNumberAvailable(
          invTrimmed ? Boolean(result?.invNumberAvailable) : null
        );
        setQrAvailable(qrTrimmed ? Boolean(result?.qrAvailable) : null);
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
  }, [invTrimmed, qrTrimmed, enabled, debounceMs]);

  const valid = useMemo(
    () =>
      computeIdentifiersValid({
        invNumber: invTrimmed,
        qr: qrTrimmed,
        invNumberAvailable,
        qrAvailable,
        checking,
        error,
      }),
    [
      invTrimmed,
      qrTrimmed,
      invNumberAvailable,
      qrAvailable,
      checking,
      error,
    ]
  );

  const available =
    (!invTrimmed || invNumberAvailable === true) &&
    (!qrTrimmed || qrAvailable === true);

  return {
    available: invTrimmed || qrTrimmed ? available : null,
    valid,
    invNumberAvailable,
    qrAvailable,
    checking,
    error,
  };
}
