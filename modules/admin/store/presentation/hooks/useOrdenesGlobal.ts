"use client";
// src/modules/admin/store/presentation/hooks/useOrdenesGlobal.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type { Orden, OrdenStatus } from "../../domain/entities/Orden.entity";

interface Filters {
  status?: OrdenStatus | "";
  search?: string;
  page?: number;
  pageSize?: number;
}

interface PaginatedResult {
  data: Orden[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useOrdenesGlobal(filters: Filters = {}) {
  const { status = "", search = "", page = 1, pageSize = 20 } = filters;
  const [result, setResult] = useState<PaginatedResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (search) params.set("search", search);
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        const res = await fetch(`/api/admin/ordenes?${params}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? "Error al cargar órdenes");
        }
        setResult(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, [status, search, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (
    id: string,
    nuevoStatus: OrdenStatus,
  ): Promise<void> => {
    const res = await fetch(`/api/admin/ordenes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoStatus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Error al actualizar estado");
    }
    load();
  };

  const updateFechaEntrega = async (
    id: string,
    fecha: string | null,
  ): Promise<void> => {
    const res = await fetch(`/api/admin/ordenes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaEntrega: fecha }),
    });
    if (!res.ok) throw new Error("Error al actualizar fecha");
    load();
  };

  return {
    ordenes: result?.data ?? [],
    total: result?.total ?? 0,
    totalPages: result?.totalPages ?? 1,
    page: result?.page ?? 1,
    isLoading: isPending,
    error,
    reload: load,
    updateStatus,
    updateFechaEntrega,
  };
}
