"use client";
// src/modules/admin/store/presentation/hooks/useOrdenes.ts

import { useState } from "react";
import type { CreateOrdenDTO, Orden } from "../../domain/entities/Orden.entity";

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

export function useOrdenes() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrden = async (dto: CreateOrdenDTO): Promise<Orden> => {
    setCreating(true);
    setError(null);
    try {
      return await apiFetch<Orden>("/api/admin/ordenes", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setCreating(false);
    }
  };

  return { createOrden, creating, error };
}

/** Valida un cupón contra el backend dado un código y subtotal actual */
export function useValidarCupon() {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validar = async (
    codigo: string,
    subtotal: number,
    clienteId?: string | null,
  ) => {
    setValidating(true);
    setError(null);
    try {
      return await apiFetch<{ cupon: any; montoDescontado: number }>(
        "/api/admin/cupones/validar",
        {
          method: "POST",
          body: JSON.stringify({
            codigo,
            subtotal,
            clienteId: clienteId ?? null,
          }),
        },
      );
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setValidating(false);
    }
  };

  return { validar, validating, error };
}

/** Actualiza el status de una orden (pipeline) */
export function useUpdateOrdenStatus() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    id: string,
    status: import("../../domain/entities/Orden.entity").OrdenStatus,
  ): Promise<Orden> => {
    setUpdating(true);
    setError(null);
    try {
      return await apiFetch<Orden>(`/api/admin/ordenes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setUpdating(false);
    }
  };

  return { updateStatus, updating, error };
}
