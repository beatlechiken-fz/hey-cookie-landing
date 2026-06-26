"use client";
// src/modules/admin/clientes/presentation/components/ClienteDetailView.tsx

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCliente } from "../hooks/useClientes";
import { useOrdenesByCliente } from "../hooks/useOrdenesByCliente";
import { useUpdateOrdenStatus } from "@/modules/admin/store/presentation/hooks/useOrdenes";
import { OrdenDetailCard } from "./OrdenDetailCard";
import { ClienteCuponesSection } from "./ClienteCuponesSection";
import { ClienteModal } from "./ClienteModal";
import type { CreateClienteDTO } from "../../domain/entities/Cliente.entity";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";

interface Props {
  clienteId: string;
}

export function ClienteDetailView({ clienteId }: Props) {
  const router = useRouter();
  const { cliente, loading, error, update } = useCliente(clienteId);
  const {
    ordenes,
    cotizaciones,
    ordenesActivas,
    isLoading: ordenesLoading,
    error: ordenesError,
    reload,
  } = useOrdenesByCliente(clienteId);
  const { updateStatus } = useUpdateOrdenStatus();

  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<"todas" | "cotizaciones" | "ordenes">("todas");

  const handleSave = useCallback(
    async (dto: CreateClienteDTO) => {
      await update(dto);
    },
    [update],
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: OrdenStatus) => {
      await updateStatus(id, status);
      reload();
    },
    [updateStatus, reload],
  );

  if (loading)
    return (
      <p className="text-center text-[#c0a0a8] text-sm py-12">Cargando…</p>
    );
  if (error || !cliente)
    return (
      <p className="text-center text-red-600 text-sm py-12">
        {error ?? "Cliente no encontrado"}
      </p>
    );

  const visibleOrdenes =
    tab === "todas"
      ? ordenes
      : tab === "cotizaciones"
        ? cotizaciones
        : ordenesActivas;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/dashboard/store/clientes")}
        className="flex items-center gap-1.5 text-[13px] text-[#b07a8a] hover:text-[#c0607a] transition self-start"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Volver a clientes
      </button>

      {/* Cliente info card */}
      <div className="rounded-2xl border border-[#f5dce4] bg-white shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#c0607a] text-white flex items-center justify-center text-lg font-bold shrink-0">
              {cliente.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#3d1a24]">
                {cliente.nombre}
              </h1>
              {cliente.authUserId ? (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-green-50 text-green-700 border-green-200">
                  Cuenta activa
                </span>
              ) : (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200">
                  Sin cuenta de acceso
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="p-2 rounded-lg hover:bg-[#fdf6f0] text-[#b07a8a] hover:text-[#c0607a] transition shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-[#c0a0a8] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-[#3d1a24]">
              {cliente.telefono ?? (
                <span className="text-[#c0a0a8]">Sin teléfono</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-[#c0a0a8] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            <span className="text-[#3d1a24]">
              {cliente.email ?? (
                <span className="text-[#c0a0a8]">Sin email</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:col-span-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-[#c0a0a8] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[#3d1a24]">
              {cliente.direccion ?? (
                <span className="text-[#c0a0a8]">Sin dirección</span>
              )}
            </span>
          </div>
        </div>

        {cliente.notas && (
          <div className="rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-3 py-2.5">
            <p className="text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider mb-1">
              Notas
            </p>
            <p className="text-[13px] text-[#7b2d42] whitespace-pre-wrap">
              {cliente.notas}
            </p>
          </div>
        )}
      </div>

      {/* Cupones asignados */}
      <ClienteCuponesSection clienteId={cliente.id} />

      {/* Pedidos */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#7b2d42]">Pedidos</h2>
          <p className="text-sm text-[#b07a8a]">
            {ordenesLoading
              ? "Cargando…"
              : `${ordenes.length} total${ordenes.length !== 1 ? "es" : ""}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f5dce4]">
          {[
            { value: "todas" as const, label: `Todas (${ordenes.length})` },
            {
              value: "cotizaciones" as const,
              label: `Cotizaciones (${cotizaciones.length})`,
            },
            {
              value: "ordenes" as const,
              label: `Órdenes (${ordenesActivas.length})`,
            },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={
                "relative px-4 py-2.5 text-sm font-semibold transition " +
                (tab === t.value
                  ? "text-[#c0607a]"
                  : "text-[#b07a8a] hover:text-[#7b2d42]")
              }
            >
              {t.label}
              {tab === t.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c0607a] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {ordenesError && <p className="text-sm text-red-600">{ordenesError}</p>}

        {!ordenesLoading && visibleOrdenes.length === 0 && (
          <div className="rounded-2xl border border-[#f5dce4] bg-[#fdf6f0] py-10 text-center text-[#c0a0a8] text-sm">
            Sin pedidos en esta categoría
          </div>
        )}

        <div className="flex flex-col gap-3">
          {visibleOrdenes.map((orden) => (
            <OrdenDetailCard
              key={orden.id}
              orden={orden}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      </div>

      <ClienteModal
        open={editOpen}
        cliente={cliente}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
