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
import { ClienteEnlaceEdicionSection } from "./ClienteEnlaceEdicionSection";
import { ClienteClubQrSection } from "./ClienteClubQrSection";
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
    canceladas,
    isLoading: ordenesLoading,
    error: ordenesError,
    reload,
  } = useOrdenesByCliente(clienteId);
  const { updateStatus } = useUpdateOrdenStatus();

  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<"todas" | "cotizaciones" | "ordenes" | "canceladas">("todas");

  const handleSave = useCallback(
    async (dto: CreateClienteDTO) => {
      await update(dto);
    },
    [update],
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: OrdenStatus, descontarInventario?: boolean) => {
      await updateStatus(id, status, descontarInventario);
      reload();
    },
    [updateStatus, reload],
  );

  if (loading)
    return (
      <p className="text-center text-hc-soft text-sm py-12">Cargando…</p>
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
        : tab === "canceladas"
          ? canceladas
          : ordenesActivas;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/dashboard/store/clientes")}
        className="flex items-center gap-1.5 text-[13px] text-hc-muted hover:text-hc-rose transition self-start"
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
      <div className="rounded-2xl border border-hc-line bg-white shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-hc-rose text-white flex items-center justify-center text-lg font-bold shrink-0">
              {cliente.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-hc-ink">
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
            className="p-2 rounded-lg hover:bg-hc-hover text-hc-muted hover:text-hc-rose transition shrink-0"
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
              className="w-4 h-4 text-hc-soft shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-hc-ink">
              {cliente.telefono ?? (
                <span className="text-hc-soft">Sin teléfono</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-hc-soft shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            <span className="text-hc-ink">
              {cliente.email ?? (
                <span className="text-hc-soft">Sin email</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:col-span-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-hc-soft shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-hc-ink">
              {cliente.direccion ?? (
                <span className="text-hc-soft">Sin dirección</span>
              )}
            </span>
          </div>
        </div>

        {cliente.fechaNacimiento && (
          <p className="text-sm text-hc-ink">
            <span className="text-hc-soft">Cumpleaños:</span>{" "}
            {new Date(`${cliente.fechaNacimiento}T12:00:00`).toLocaleDateString(
              "es-MX",
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </p>
        )}

        {cliente.notas && (
          <div className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
            <p className="text-[11px] font-semibold text-hc-muted uppercase tracking-wider mb-1">
              Notas
            </p>
            <p className="text-[13px] text-hc-soft whitespace-pre-wrap">
              {cliente.notas}
            </p>
          </div>
        )}
      </div>

      {/* Tarjeta del club (QR persistente) */}
      <ClienteClubQrSection
        clienteId={cliente.id}
        qrToken={cliente.qrToken}
        nombreCliente={cliente.nombre}
      />

      {/* Enlace para que el cliente actualice sus datos */}
      <ClienteEnlaceEdicionSection clienteId={cliente.id} />

      {/* Cupones asignados */}
      <ClienteCuponesSection clienteId={cliente.id} />

      {/* Pedidos */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-hc-soft">Pedidos</h2>
          <p className="text-sm text-hc-muted">
            {ordenesLoading
              ? "Cargando…"
              : `${ordenes.length} total${ordenes.length !== 1 ? "es" : ""}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-hc-line">
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
            {
              value: "canceladas" as const,
              label: `Canceladas (${canceladas.length})`,
            },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={
                "relative shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition " +
                (tab === t.value
                  ? "text-hc-rose"
                  : "text-hc-muted hover:text-hc-soft")
              }
            >
              {t.label}
              {tab === t.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hc-rose rounded-full" />
              )}
            </button>
          ))}
        </div>

        {ordenesError && <p className="text-sm text-red-600">{ordenesError}</p>}

        {!ordenesLoading && visibleOrdenes.length === 0 && (
          <div className="rounded-2xl border border-hc-line bg-hc-hover py-10 text-center text-hc-soft text-sm">
            Sin pedidos en esta categoría
          </div>
        )}

        <div className="flex flex-col gap-3">
          {visibleOrdenes.map((orden) => (
            <OrdenDetailCard
              key={orden.id}
              orden={orden}
              onUpdateStatus={handleUpdateStatus}
              onRefresh={reload}
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
