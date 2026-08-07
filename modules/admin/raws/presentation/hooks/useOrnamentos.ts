"use client";
// src/modules/admin/raws/presentation/hooks/useOrnamentos.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Ornamento,
  CreateOrnamentoDTO,
  UpdateOrnamentoDTO,
} from "../../domain/entities/Ornamento.entity";
import type { PaginatedResult } from "../../domain/repositories/Ornamento.repository";

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

export function useOrnamentos() {
  const [result, setResult] = useState<PaginatedResult<Ornamento> | null>(null);
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
          await apiFetch<PaginatedResult<Ornamento>>(
            `/api/admin/ornamentos?${params}`,
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

  const setSearch = (s: string) => { setSearchState(s); setPageState(1); };
  const setPage   = (p: number) => setPageState(p);

  const create = async (dto: CreateOrnamentoDTO) => {
    const c = await apiFetch<Ornamento>("/api/admin/ornamentos", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateOrnamentoDTO) => {
    const u = await apiFetch<Ornamento>(`/api/admin/ornamentos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/ornamentos/${id}`, { method: "DELETE" });
    load(search, page);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/ornamentos/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Error al subir imagen");
    }
    return (await res.json()).url as string;
  };

  return {
    ornamentos: result?.data ?? [],
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
    uploadImage,
  };
}
