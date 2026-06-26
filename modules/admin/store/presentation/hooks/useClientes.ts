"use client";
// src/modules/admin/clientes/presentation/hooks/useClientes.ts

import { useState, useEffect, useCallback, useTransition } from "react";
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
} from "../../domain/entities/Cliente.entity";
import type { PaginatedResult } from "../../domain/repositories/Cliente.repository";

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

export function useClientes() {
  const [result, setResult] = useState<PaginatedResult<Cliente> | null>(null);
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
          await apiFetch<PaginatedResult<Cliente>>(
            `/api/admin/clientes?${params}`,
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

  const create = async (dto: CreateClienteDTO) => {
    const c = await apiFetch<Cliente>("/api/admin/clientes", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return c;
  };

  const update = async (id: string, dto: UpdateClienteDTO) => {
    const u = await apiFetch<Cliente>(`/api/admin/clientes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    load(search, page);
    return u;
  };

  const remove = async (id: string) => {
    await apiFetch<void>(`/api/admin/clientes/${id}`, { method: "DELETE" });
    load(search, page);
  };

  return {
    clientes: result?.data ?? [],
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

export function useCliente(id: string | null) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    apiFetch<Cliente>(`/api/admin/clientes/${id}`)
      .then((c) => {
        if (active) setCliente(c);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const update = async (dto: UpdateClienteDTO) => {
    if (!id) return;
    const updated = await apiFetch<Cliente>(`/api/admin/clientes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
    setCliente(updated);
    return updated;
  };

  return { cliente, loading, error, update, reload };
}
