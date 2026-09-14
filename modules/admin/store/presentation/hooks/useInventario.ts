"use client";
// src/modules/admin/store/presentation/hooks/useInventario.ts

import { useCallback, useEffect, useState } from "react";
import type {
  ProductoStock,
  Produccion,
  CreateProduccionDTO,
  InventarioMovimiento,
} from "../../domain/entities/Inventario.entity";
import type { PaginatedResult } from "../../domain/repositories/Producto.repository";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Error desconocido");
  }
  return res.json();
}

/** Tabla de stock por producto — búsqueda + paginación, para la vista de Producción. */
export function useInventarioStock() {
  const [data, setData] = useState<PaginatedResult<ProductoStock> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), pageSize: "50" });
    if (search) qs.set("search", search);
    fetch(`/api/admin/inventario/stock?${qs}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, search, setSearch, page, setPage, reload: load };
}

/** Registro de producción — histórico + acción de registrar un nuevo lote. */
export function useProducciones(productoId?: string) {
  const [data, setData] = useState<PaginatedResult<Produccion> | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ pageSize: "30" });
    if (productoId) qs.set("productoId", productoId);
    fetch(`/api/admin/inventario/producciones?${qs}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [productoId]);

  useEffect(() => {
    load();
  }, [load]);

  const registrar = async (dto: CreateProduccionDTO) => {
    setRegistrando(true);
    setError(null);
    try {
      const created = await apiFetch<Produccion>("/api/admin/inventario/producciones", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      load();
      return created;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setRegistrando(false);
    }
  };

  return { data, loading, registrar, registrando, error, reload: load };
}

/** Stock + historial de movimientos de UN producto — para mostrarlo al ver el producto. */
export function useStockProducto(productoId: string | null) {
  const [data, setData] = useState<
    (ProductoStock & { movimientos: InventarioMovimiento[] }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productoId) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/inventario/stock/${productoId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [productoId]);

  return { data, loading };
}
