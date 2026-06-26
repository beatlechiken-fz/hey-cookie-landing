"use client";
// src/modules/admin/clientes/presentation/hooks/useOrdenesByCliente.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Orden,
  OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useOrdenesByCliente(clienteId: string | null) {
  const [result, setResult] = useState<PaginatedResult<Orden> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!clienteId) return;
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/ordenes?clienteId=${clienteId}&pageSize=50`,
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? "Error al cargar órdenes");
        }
        setResult(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, [clienteId]);

  useEffect(() => {
    load();
  }, [load]);

  const ordenes = result?.data ?? [];
  // Cotizaciones y órdenes son la misma entidad, diferenciadas por status
  const cotizaciones = ordenes.filter((o) => o.status === "cotizacion");
  const ordenesActivas = ordenes.filter((o) => o.status !== "cotizacion");

  return {
    ordenes,
    cotizaciones,
    ordenesActivas,
    isLoading: isPending,
    error,
    reload: load,
  };
}
