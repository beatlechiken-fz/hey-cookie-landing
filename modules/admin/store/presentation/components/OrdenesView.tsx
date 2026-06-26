"use client";
// src/modules/admin/ordenes/presentation/components/OrdenesView.tsx
//
// Vista principal del módulo de Órdenes.
// Tabs horizontales: Cotizaciones | Órdenes
// Lista global con click → detalle (reutiliza OrdenDetailCard del módulo clientes)

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useOrdenesGlobal } from "@/modules/admin/store/presentation/hooks/useOrdenesGlobal";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";
import { ORDEN_STATUS_LABELS } from "@/modules/admin/store/domain/entities/Orden.entity";

// ── Badge de status ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  cotizacion: "bg-blue-50   text-blue-700   border-blue-200",
  en_proceso: "bg-amber-50  text-amber-700  border-amber-200",
  listo_entregar: "bg-purple-50 text-purple-700 border-purple-200",
  pagado: "bg-green-50  text-green-700  border-green-200",
  entregado: "bg-teal-50   text-teal-700   border-teal-200",
  cancelado: "bg-red-50    text-red-600    border-red-200",
};

function StatusBadge({ status }: { status: OrdenStatus }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] ?? ""}`}
    >
      {ORDEN_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}

// ── Tipos de pestaña ──────────────────────────────────────────────────────────
type Tab = "cotizaciones" | "ordenes";

const TAB_STATUSES: Record<Tab, OrdenStatus[]> = {
  cotizaciones: ["cotizacion"],
  ordenes: ["en_proceso", "listo_entregar", "pagado", "entregado", "cancelado"],
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OrdenesView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cotizaciones");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Cada tab filtra por su conjunto de statuses
  // La API soporta `status` como un único valor — para múltiples usamos sin filtro
  // y filtramos en cliente (pageSize grande para compensar)
  const {
    ordenes: todas,
    total,
    totalPages,
    isLoading,
    error,
  } = useOrdenesGlobal({
    search,
    page,
    pageSize: 50,
  });

  // Filtrar por tab en cliente
  const statuses = TAB_STATUSES[tab];
  const ordenes = todas.filter((o) => statuses.includes(o.status));

  function handleTabChange(t: Tab) {
    setTab(t);
    setPage(1);
    setSearch("");
  }

  const inputCls =
    "w-full pl-4 pr-4 py-2.5 rounded-xl border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 placeholder:text-[#c0a0a8]";

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs horizontales */}
      <div className="flex bg-[#fdf6f0] border border-[#f5dce4] rounded-xl p-1 gap-1 w-fit">
        {[
          { key: "cotizaciones" as Tab, label: "Cotizaciones", icon: "📋" },
          { key: "ordenes" as Tab, label: "Órdenes", icon: "📦" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold transition ${
              tab === t.key
                ? "bg-white text-[#7b2d42] shadow-sm border border-[#f5dce4]"
                : "text-[#b07a8a] hover:text-[#7b2d42]"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={
            tab === "cotizaciones"
              ? "Buscar cotización por cliente o número…"
              : "Buscar orden por cliente o número…"
          }
          className={inputCls}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0a0a8] pointer-events-none">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-[#b07a8a]">
        {isLoading
          ? "Cargando…"
          : `${ordenes.length} ${tab === "cotizaciones" ? "cotización" : "orden"}${ordenes.length !== 1 ? "es" : ""}`}
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Tabla desktop */}
      {!isLoading && (
        <div className="hidden md:block rounded-2xl border border-[#f5dce4] overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fdf6f0] border-b border-[#f5dce4]">
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                  {tab === "cotizaciones" ? "Cotización" : "Orden"}
                </th>
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                  Fecha
                </th>
                {tab === "ordenes" && (
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                    Estado
                  </th>
                )}
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-4 py-3 text-right  text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9eef2]">
              {ordenes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[#c0a0a8] text-sm"
                  >
                    No hay {tab === "cotizaciones" ? "cotizaciones" : "órdenes"}{" "}
                    {search ? "con ese criterio" : "aún"}
                  </td>
                </tr>
              )}
              {ordenes.map((o) => (
                <tr
                  key={o.id}
                  onClick={() =>
                    router.push(`/admin/dashboard/store/ordenes/${o.id}`)
                  }
                  className="hover:bg-[#fdf6f0]/60 transition cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#3d1a24]">#{o.numero}</p>
                    <p className="text-[11px] text-[#b07a8a]">
                      {fmtDate(o.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#3d1a24]">
                      {o.clienteNombre ?? "Sin cliente"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#7b2d42]/70 text-[13px]">
                    {fmtDate(o.createdAt)}
                  </td>
                  {tab === "ordenes" && (
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  )}
                  <td className="px-4 py-3 text-[#7b2d42]/70 text-[13px]">
                    {o.fechaEntrega ? (
                      fmtDate(o.fechaEntrega)
                    ) : (
                      <span className="text-[#c0a0a8]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#c0607a]">
                    {fmtMoney(o.total)}
                  </td>
                  <td className="px-4 py-3 text-center text-[#b07a8a] text-[13px]">
                    {o.items.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards mobile */}
      {!isLoading && (
        <div className="flex md:hidden flex-col gap-3">
          {ordenes.length === 0 && (
            <p className="text-center text-[#c0a0a8] text-sm py-8">
              No hay {tab === "cotizaciones" ? "cotizaciones" : "órdenes"}{" "}
              {search ? "con ese criterio" : "aún"}
            </p>
          )}
          {ordenes.map((o) => (
            <div
              key={o.id}
              onClick={() =>
                router.push(`/admin/dashboard/store/ordenes/${o.id}`)
              }
              className="bg-white rounded-2xl border border-[#f5dce4] p-4 shadow-sm cursor-pointer active:bg-[#fdf6f0]/60 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-[#3d1a24]">
                    {tab === "cotizaciones" ? "Cotización" : "Orden"} #
                    {o.numero}
                  </p>
                  <p className="text-[12px] text-[#b07a8a]">
                    {o.clienteNombre ?? "Sin cliente"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-[#c0607a] text-sm">
                    {fmtMoney(o.total)}
                  </span>
                  {tab === "ordenes" && <StatusBadge status={o.status} />}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#b07a8a]">
                <span>{fmtDate(o.createdAt)}</span>
                {o.fechaEntrega ? (
                  <span>Entrega: {fmtDate(o.fechaEntrega)}</span>
                ) : (
                  <span>
                    {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-[#b07a8a]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
