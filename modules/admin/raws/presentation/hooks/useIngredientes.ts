"use client";
// src/modules/admin/store/presentation/hooks/useIngredientes.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Ingrediente,
  CreateIngredienteDTO,
  UpdateIngredienteDTO,
  ToppingCantidad,
  UpsertToppingCantidadDTO,
  CategoriaIngrediente,
} from "../../domain/entities/Ingrediente.entity";
import type { PaginatedResult } from "../../domain/repositories/Ingrediente.repository";

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

// ── useIngredientes ───────────────────────────────────────────────────────────

interface Filters {
  search: string;
  unidadBase: string;
  categoria: CategoriaIngrediente | "";
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  unidadBase: "",
  categoria: "",
  page: 1,
  pageSize: 20,
};

export function useIngredientes() {
  const [result, setResult] = useState<PaginatedResult<Ingrediente> | null>(
    null,
  );
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((f: Filters) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(f.page),
          pageSize: String(f.pageSize),
          ...(f.search ? { search: f.search } : {}),
          ...(f.unidadBase ? { unidadBase: f.unidadBase } : {}),
          ...(f.categoria ? { categoria: f.categoria } : {}),
        });
        setResult(
          await apiFetch<PaginatedResult<Ingrediente>>(
            `/api/admin/ingredientes?${params}`,
          ),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const setSearch = (search: string) =>
    setFilters((f) => ({ ...f, search, page: 1 }));
  const setUnidadBase = (unidadBase: string) =>
    setFilters((f) => ({ ...f, unidadBase, page: 1 }));
  const setCategoria = (categoria: CategoriaIngrediente | "") =>
    setFilters((f) => ({ ...f, categoria, page: 1 }));
  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  const create = async (dto: CreateIngredienteDTO) => {
    const c = await apiFetch<Ingrediente>("/api/admin/ingredientes", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(filters);
    return c;
  };

  const update = async (id: string, dto: UpdateIngredienteDTO) => {
    const u = await apiFetch<Ingrediente>(`/api/admin/ingredientes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(filters);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/ingredientes/${id}`, { method: "DELETE" });
    load(filters);
  };

  const toggleTopping = async (id: string, value: boolean) => {
    const updated = await apiFetch<Ingrediente>(
      `/api/admin/ingredientes/${id}/topping`,
      {
        method: "PATCH",
        body: JSON.stringify({ value }),
      },
    );
    load(filters);
    return updated;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/ingredientes/upload", {
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
    ingredientes: result?.data ?? [],
    total: result?.total ?? 0,
    totalPages: result?.totalPages ?? 1,
    page: filters.page,
    search: filters.search,
    unidadBase: filters.unidadBase,
    categoria: filters.categoria,
    isLoading: isPending,
    error,
    setSearch,
    setUnidadBase,
    setCategoria,
    setPage,
    create,
    update,
    remove,
    toggleTopping,
    uploadImage,
  };
}

// ── useToppings ───────────────────────────────────────────────────────────────

export interface ToppingItem {
  ingrediente: Ingrediente;
  cantidad: ToppingCantidad | null;
}

export function useToppings() {
  const [items, setItems] = useState<ToppingItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        setItems(await apiFetch<ToppingItem[]>("/api/admin/toppings"));
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upsertCantidad = async (dto: UpsertToppingCantidadDTO) => {
    await apiFetch<ToppingCantidad>(
      `/api/admin/toppings/${dto.ingredienteId}`,
      {
        method: "PUT",
        body: JSON.stringify(dto),
      },
    );
    load();
  };

  const removeTopping = async (ingredienteId: string) => {
    await apiFetch<void>(`/api/admin/toppings/${ingredienteId}`, {
      method: "DELETE",
    });
    load();
  };

  return { items, isLoading: isPending, error, upsertCantidad, removeTopping };
}

// ── useLicores ────────────────────────────────────────────────────────────────

import type {
  LicorCantidad,
  UpsertLicorCantidadDTO,
} from "../../domain/entities/Ingrediente.entity";

export interface LicorItem {
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  costoUnidadMinima: number | null;
  cantidad: number | null;
  notas: string | null;
}

export function useLicores() {
  const [items, setItems] = useState<LicorItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const data = await apiFetch<LicorCantidad[]>("/api/admin/licores");
        setItems(
          data.map((d) => ({
            ingredienteId: d.ingredienteId,
            ingredienteNombre: d.ingredienteNombre,
            ingredienteUnidad: d.ingredienteUnidad,
            costoUnidadMinima: d.costoUnidadMinima,
            cantidad: d.cantidad,
            notas: d.notas,
          })),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upsertCantidad = async (dto: UpsertLicorCantidadDTO) => {
    await apiFetch<LicorCantidad>(`/api/admin/licores/${dto.ingredienteId}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
    load();
  };

  return { items, isLoading: isPending, error, upsertCantidad };
}
