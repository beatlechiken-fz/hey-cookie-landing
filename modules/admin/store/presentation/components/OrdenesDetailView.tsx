"use client";
// src/modules/admin/ordenes/presentation/components/OrdenDetailView.tsx
//
// Vista de detalle de una orden/cotización individual.
// Reutiliza OrdenDetailCard (pipeline, PDF, etc.) igual que en el módulo clientes.

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import type {
  Orden,
  OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import { OrdenDetailCard } from "./OrdenDetailCard";

interface Props {
  ordenId: string;
}

export function OrdenDetailView({ ordenId }: Props) {
  const router = useRouter();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [isPending, startTrans] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    startTrans(async () => {
      setError(null);
      try {
        const res = await fetch(`/api/admin/ordenes/${ordenId}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? "No encontrada");
        }
        setOrden(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, [ordenId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = useCallback(
    async (id: string, status: OrdenStatus) => {
      const res = await fetch(`/api/admin/ordenes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Error al actualizar estado");
      }
      load();
    },
    [load],
  );

  // Determinar si es cotización u orden para el breadcrumb
  const esCotizacion = orden?.status === "cotizacion";
  const seccion = esCotizacion ? "cotizaciones" : "ordenes";
  const label = esCotizacion ? "Cotizaciones" : "Órdenes";

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#b07a8a]">
        <button
          onClick={() => router.push("/admin/dashboard/store/ordenes")}
          className="hover:text-[#c0607a] transition font-medium"
        >
          {label}
        </button>
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-[#7b2d42] font-semibold">
          {orden ? `#${orden.numero}` : "Cargando…"}
        </span>
        {orden?.clienteNombre && (
          <>
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-[#b07a8a]">{orden.clienteNombre}</span>
          </>
        )}
      </div>

      {/* Estado de carga */}
      {isPending && (
        <div className="rounded-2xl border border-[#f5dce4] bg-white p-8 text-center text-[#c0a0a8] text-sm">
          Cargando detalle…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => router.push("/admin/dashboard/store/ordenes")}
            className="mt-3 text-sm text-[#c0607a] hover:underline"
          >
            ← Volver a la lista
          </button>
        </div>
      )}

      {/* Detalle — reutiliza exactamente el mismo componente que en clientes */}
      {orden && !isPending && (
        <OrdenDetailCard orden={orden} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
}
