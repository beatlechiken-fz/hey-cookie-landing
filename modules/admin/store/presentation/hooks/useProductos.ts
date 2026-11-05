"use client";
// src/modules/admin/productos/presentation/hooks/useProductos.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Producto,
  CreateProductoDTO,
  UpdateProductoDTO,
  LineaProducto,
} from "../../domain/entities/Producto.entity";
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
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** "" = activos e inactivos. */
export type EstadoProducto = "" | "activo" | "inactivo";

export function useProductos(
  initialLinea?: LineaProducto | "",
  initialEstado: EstadoProducto = "",
) {
  const [result, setResult] = useState<PaginatedResult<Producto> | null>(null);
  const [search, setSearchState] = useState("");
  const [linea, setLineaState] = useState<LineaProducto | "">(
    initialLinea ?? "",
  );
  const [estado, setEstadoState] = useState<EstadoProducto>(initialEstado);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((s: string, l: LineaProducto | "", e: EstadoProducto) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams({
          pageSize: "100",
          ...(s ? { search: s } : {}),
          ...(l ? { linea: l } : {}),
          ...(e ? { activo: String(e === "activo") } : {}),
        });
        setResult(
          await apiFetch<PaginatedResult<Producto>>(
            `/api/admin/productos?${params}`,
          ),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(search, linea, estado);
  }, [search, linea, estado, load]);

  const setSearch = (s: string) => setSearchState(s);
  const setLinea = (l: LineaProducto | "") => setLineaState(l);
  const setEstado = (e: EstadoProducto) => setEstadoState(e);

  const create = async (dto: CreateProductoDTO) => {
    const p = await apiFetch<Producto>("/api/admin/productos", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, linea, estado);
    return p;
  };

  const update = async (id: string, dto: UpdateProductoDTO) => {
    const p = await apiFetch<Producto>(`/api/admin/productos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, linea, estado);
    return p;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/productos/${id}`, { method: "DELETE" });
    load(search, linea, estado);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/productos/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Error al subir imagen");
    }
    const data = await res.json();
    return data.url as string;
  };

  return {
    productos: result?.data ?? [],
    total: result?.total ?? 0,
    isLoading: isPending,
    error,
    search,
    linea,
    setSearch,
    setLinea,
    create,
    update,
    remove,
    uploadImage,
    estado,
    setEstado,
    reload: () => load(search, linea, estado),
  };
}
