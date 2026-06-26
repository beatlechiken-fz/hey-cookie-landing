"use client";
// src/modules/admin/finanzas/presentation/hooks/useFinanzas.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  FinanzasRegistro,
  CreateFinanzasRegistroDTO,
  UpdateFinanzasRegistroDTO,
  FinanzasMovimiento,
  CreateMovimientoDTO,
  FinanzasCompra,
  CreateCompraDTO,
  UpdateCompraDTO,
  ResumenFinanciero,
} from "../../domain/entities/Finanzas.entity";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(e.error ?? "Error");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Período por defecto: año en curso
function periodoDefault() {
  const hoy = new Date().toISOString().slice(0, 10);
  const anio = hoy.slice(0, 4);
  return { desde: `${anio}-01-01`, hasta: hoy };
}

// ── Registros ────────────────────────────────────────────────────────────────

export function useRegistros(desde?: string, hasta?: string) {
  const [registros, setRegistros] = useState<FinanzasRegistro[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((d?: string, h?: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (d) params.set("desde", d);
        if (h) params.set("hasta", h);
        setRegistros(
          await apiFetch<FinanzasRegistro[]>(`/api/admin/registros?${params}`),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(desde, hasta);
  }, [desde, hasta, load]);

  const create = async (dto: CreateFinanzasRegistroDTO) => {
    const r = await apiFetch<FinanzasRegistro>("/api/admin/registros", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(desde, hasta);
    return r;
  };
  const update = async (id: string, dto: UpdateFinanzasRegistroDTO) => {
    const r = await apiFetch<FinanzasRegistro>(`/api/admin/registros/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(desde, hasta);
    return r;
  };
  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/registros/${id}`, {
      method: "DELETE",
    });
    load(desde, hasta);
  };

  return {
    registros,
    isLoading: isPending,
    error,
    create,
    update,
    remove,
    reload: () => load(desde, hasta),
  };
}

// ── Movimientos ──────────────────────────────────────────────────────────────

export function useMovimientos(desde?: string, hasta?: string) {
  const [movimientos, setMovimientos] = useState<FinanzasMovimiento[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((d?: string, h?: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (d) params.set("desde", d);
        if (h) params.set("hasta", h);
        setMovimientos(
          await apiFetch<FinanzasMovimiento[]>(
            `/api/admin/movimientos?${params}`,
          ),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(desde, hasta);
  }, [desde, hasta, load]);

  const create = async (dto: CreateMovimientoDTO) => {
    const r = await apiFetch<FinanzasMovimiento>("/api/admin/movimientos", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(desde, hasta);
    return r;
  };
  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/movimientos/${id}`, {
      method: "DELETE",
    });
    load(desde, hasta);
  };

  return {
    movimientos,
    isLoading: isPending,
    error,
    create,
    remove,
    reload: () => load(desde, hasta),
  };
}

// ── Compras ──────────────────────────────────────────────────────────────────

export function useCompras(desde?: string, hasta?: string) {
  const [compras, setCompras] = useState<FinanzasCompra[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((d?: string, h?: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (d) params.set("desde", d);
        if (h) params.set("hasta", h);
        setCompras(
          await apiFetch<FinanzasCompra[]>(`/api/admin/compras?${params}`),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(desde, hasta);
  }, [desde, hasta, load]);

  const create = async (dto: CreateCompraDTO) => {
    const r = await apiFetch<FinanzasCompra>("/api/admin/compras", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(desde, hasta);
    return r;
  };
  const update = async (id: string, dto: UpdateCompraDTO) => {
    const r = await apiFetch<FinanzasCompra>(`/api/admin/compras/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(desde, hasta);
    return r;
  };
  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/compras/${id}`, {
      method: "DELETE",
    });
    load(desde, hasta);
  };

  return {
    compras,
    isLoading: isPending,
    error,
    create,
    update,
    remove,
    reload: () => load(desde, hasta),
  };
}

// ── Resumen ──────────────────────────────────────────────────────────────────

export function useResumen(desde?: string, hasta?: string) {
  const pd = periodoDefault();
  const d = desde ?? pd.desde;
  const h = hasta ?? pd.hasta;

  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((d: string, h: string) => {
    startTransition(async () => {
      setError(null);
      try {
        setResumen(
          await apiFetch<ResumenFinanciero>(
            `/api/admin/resumen?desde=${d}&hasta=${h}`,
          ),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(d, h);
  }, [d, h, load]);

  return { resumen, isLoading: isPending, error, reload: () => load(d, h) };
}
