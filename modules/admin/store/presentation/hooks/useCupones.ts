"use client";
// src/modules/admin/store/presentation/hooks/useCupones.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Cupon,
  CreateCuponDTO,
  UpdateCuponDTO,
} from "../../domain/entities/Cupon.entity";
import type { PaginatedResult } from "../../data/datasources/Cupon.datasource";

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

export function useCupones() {
  const [result, setResult] = useState<PaginatedResult<Cupon> | null>(null);
  const [search, setSearchState] = useState("");
  const [page, setPageState] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((s: string, p: number) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(p),
          pageSize: "20",
          ...(s ? { search: s } : {}),
        });
        setResult(
          await apiFetch<PaginatedResult<Cupon>>(
            `/api/admin/cupones?${params}`,
          ),
        );
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  useEffect(() => {
    load(search, page);
  }, [search, page, load]);

  const setSearch = (s: string) => {
    setSearchState(s);
    setPageState(1);
  };
  const setPage = (p: number) => setPageState(p);

  const create = async (dto: CreateCuponDTO) => {
    const c = await apiFetch<Cupon>("/api/admin/cupones", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateCuponDTO) => {
    const u = await apiFetch<Cupon>(`/api/admin/cupones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/cupones/${id}`, { method: "DELETE" });
    load(search, page);
  };

  return {
    cupones: result?.data ?? [],
    total: result?.total ?? 0,
    totalPages: result?.totalPages ?? 1,
    page,
    search,
    isLoading: isPending,
    error,
    setSearch,
    setPage,
    create,
    update,
    remove,
  };
}
