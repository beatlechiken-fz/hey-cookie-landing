"use client";
// src/modules/admin/store/presentation/hooks/useClienteEnlaceEdicion.ts

import { useCallback, useEffect, useState } from "react";
import type { EnlaceEdicionCompartible } from "../../domain/entities/ClienteEnlaceEdicion.entity";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Error desconocido");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Enlace de actualización de datos de un cliente (ficha del admin). */
export function useClienteEnlaceEdicion(clienteId: string) {
  const url = `/api/admin/clientes/${clienteId}/enlace-edicion`;
  const [enlace, setEnlace] = useState<EnlaceEdicionCompartible | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    apiFetch<EnlaceEdicionCompartible | null>(url)
      .then((e) => vivo && setEnlace(e))
      .catch((e) => vivo && setError(e.message))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [url]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setWorking(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  }, []);

  const generar = (regenerar = false) =>
    run(async () => {
      setEnlace(
        await apiFetch<EnlaceEdicionCompartible>(url, {
          method: "POST",
          body: JSON.stringify({ regenerar }),
        }),
      );
    });

  const revocar = () =>
    run(async () => {
      await apiFetch<void>(url, { method: "DELETE" });
      setEnlace(null);
    });

  return { enlace, loading, working, error, generar, revocar };
}

function csvCelda(v: string | null): string {
  const s = v ?? "";
  // Evita inyección de fórmulas al abrir el CSV en Excel/Sheets
  const seguro = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${seguro.replace(/"/g, '""')}"`;
}

/** Genera (o reutiliza) los enlaces de todos los clientes activos y descarga un CSV. */
export function useEnlacesMasivos() {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descargarCsv = useCallback(async () => {
    setWorking(true);
    setError(null);
    try {
      const enlaces = await apiFetch<EnlaceEdicionCompartible[]>(
        "/api/admin/clientes/enlaces-edicion",
        { method: "POST" },
      );
      const filas = [
        ["Nombre", "Teléfono", "Email", "Enlace", "WhatsApp", "Vence"],
        ...enlaces.map((e) => [
          e.nombre,
          e.telefono,
          e.email,
          e.url,
          e.whatsappUrl,
          e.expiraAt.slice(0, 10),
        ]),
      ];
      const csv = "﻿" + filas.map((f) => f.map(csvCelda).join(",")).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `enlaces-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      return enlaces.length;
    } catch (e) {
      setError((e as Error).message);
      return 0;
    } finally {
      setWorking(false);
    }
  }, []);

  return { descargarCsv, working, error };
}
