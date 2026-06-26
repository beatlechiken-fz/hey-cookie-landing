"use client";
// src/modules/admin/store/presentation/hooks/useEmpaques.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Empaque,
  CreateEmpaqueDTO,
  UpdateEmpaqueDTO,
} from "../../domain/entities/Empaque.entity";
import type { PaginatedResult } from "../../domain/repositories/Empaque.repository";

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

export function useEmpaques() {
  const [result, setResult] = useState<PaginatedResult<Empaque> | null>(null);
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
          await apiFetch<PaginatedResult<Empaque>>(
            `/api/admin/empaques?${params}`,
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

  const create = async (dto: CreateEmpaqueDTO) => {
    const c = await apiFetch<Empaque>("/api/admin/empaques", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateEmpaqueDTO) => {
    const u = await apiFetch<Empaque>(`/api/admin/empaques/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/empaques/${id}`, { method: "DELETE" });
    load(search, page);
  };

  // Sube una imagen y devuelve la URL pública
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/empaques/upload", {
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
    empaques: result?.data ?? [],
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
