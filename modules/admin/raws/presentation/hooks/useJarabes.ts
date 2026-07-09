"use client";
// src/modules/admin/raws/presentation/hooks/useJarabes.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Jarabe,
  CreateJarabeDTO,
  UpdateJarabeDTO,
} from "../../domain/entities/Jarabe.entity";
import type { PaginatedResult } from "../../domain/repositories/Jarabe.repository";

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

export function useJarabes() {
  const [result, setResult] = useState<PaginatedResult<Jarabe> | null>(null);
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
          await apiFetch<PaginatedResult<Jarabe>>(
            `/api/admin/jarabes?${params}`,
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

  const create = async (dto: CreateJarabeDTO) => {
    const c = await apiFetch<Jarabe>("/api/admin/jarabes", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateJarabeDTO) => {
    const u = await apiFetch<Jarabe>(`/api/admin/jarabes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/jarabes/${id}`, { method: "DELETE" });
    load(search, page);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/jarabes/upload", {
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
    jarabes: result?.data ?? [],
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

// ── useSaboresJarabe ──────────────────────────────────────────────────────────

import type {
  SaborJarabe,
  CreateSaborJarabeDTO,
  UpdateSaborJarabeDTO,
} from "../../domain/entities/Jarabe.entity";

export function useSaboresJarabe() {
  const [result, setResult] = useState<PaginatedResult<SaborJarabe> | null>(
    null,
  );
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
          await apiFetch<PaginatedResult<SaborJarabe>>(
            `/api/admin/sabores-jarabe?${params}`,
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

  const create = async (dto: CreateSaborJarabeDTO) => {
    const c = await apiFetch<SaborJarabe>("/api/admin/sabores-jarabe", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateSaborJarabeDTO) => {
    const u = await apiFetch<SaborJarabe>(`/api/admin/sabores-jarabe/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/sabores-jarabe/${id}`, {
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
