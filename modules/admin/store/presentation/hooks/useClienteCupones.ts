"use client";
// src/modules/admin/clientes/presentation/hooks/useClienteCupones.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type { Cupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

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

/** Cupones individuales asignados a un cliente específico (relación m2m) */
export function useClienteCupones(clienteId: string | null) {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!clienteId) return;
    startTransition(async () => {
      setError(null);
      try {
        setCupones(
          await apiFetch<Cupon[]>(
            `/api/admin/cupones/asignados?clienteId=${clienteId}`,
          ),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, [clienteId]);

  useEffect(() => {
    load();
  }, [load]);

  const asignar = async (cuponId: string) => {
    if (!clienteId) return;
    setActionError(null);
    try {
      await apiFetch(`/api/admin/cupones/${cuponId}/asignar`, {
        method: "POST",
        body: JSON.stringify({ clienteId }),
      });
      load();
    } catch (e: any) {
      setActionError(e.message);
      throw e;
    }
  };

  const desasignar = async (cuponId: string) => {
    if (!clienteId) return;
    setActionError(null);
    try {
      await apiFetch(`/api/admin/cupones/${cuponId}/desasignar`, {
        method: "POST",
        body: JSON.stringify({ clienteId }),
      });
      load();
    } catch (e: any) {
      setActionError(e.message);
      throw e;
    }
  };

  return {
    cupones,
    isLoading: isPending,
    error,
    actionError,
    asignar,
    desasignar,
    reload: load,
  };
}

/** Cupones individuales activos NO asignados aún a este cliente */
export function useCuponesDisponibles(clienteId: string | null) {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (s: string) => {
      if (!clienteId) return;
      startTransition(async () => {
        setError(null);
        try {
          const params = new URLSearchParams({
            clienteId,
            ...(s ? { search: s } : {}),
          });
          setCupones(
            await apiFetch<Cupon[]>(
              `/api/admin/cupones/disponibles-para-cliente?${params}`,
            ),
          );
        } catch (e: any) {
          setError(e.message);
        }
      });
    },
    [clienteId],
  );

  useEffect(() => {
    load(search);
  }, [search, load]);

  return {
    cupones,
    search,
    setSearch,
    isLoading: isPending,
    error,
    reload: () => load(search),
  };
}
