"use client";
// src/features/coberturas/presentation/hooks/useCoberturas.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Cobertura,
  CreateCoberturaDTO,
  UpdateCoberturaDTO,
  Sabor,
  CreateSaborDTO,
  UpdateSaborDTO,
} from "../../domain/entities/Cobertura.entity";
import type { PaginatedResult } from "../../domain/repositories/Cobertura.repository";

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

// ── Coberturas ────────────────────────────────────────────────────────────────

export function useCoberturas() {
  const [result, setResult] = useState<PaginatedResult<Cobertura> | null>(null);
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
          await apiFetch<PaginatedResult<Cobertura>>(
            `/api/admin/coberturas?${params}`,
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

  const create = async (dto: CreateCoberturaDTO) => {
    const c = await apiFetch<Cobertura>("/api/admin/coberturas", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateCoberturaDTO) => {
    const u = await apiFetch<Cobertura>(`/api/admin/coberturas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/coberturas/${id}`, { method: "DELETE" });
    load(search, page);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/coberturas/upload", {
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
    coberturas: result?.data ?? [],
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

// ── Sabores ───────────────────────────────────────────────────────────────────

export function useSabores() {
  const [result, setResult] = useState<PaginatedResult<Sabor> | null>(null);
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
          pageSize: "50",
          ...(s ? { search: s } : {}),
        });
        setResult(
          await apiFetch<PaginatedResult<Sabor>>(
            `/api/admin/sabores-cobertura?${params}`,
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

  const create = async (dto: CreateSaborDTO) => {
    const c = await apiFetch<Sabor>("/api/admin/sabores-cobertura", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateSaborDTO) => {
    const u = await apiFetch<Sabor>(`/api/admin/sabores-cobertura/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/sabores-cobertura/${id}`, {
      method: "DELETE",
    });
    load(search, page);
  };

  return {
    sabores: result?.data ?? [],
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
