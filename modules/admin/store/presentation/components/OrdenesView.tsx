"use client";
// src/modules/admin/ordenes/presentation/components/OrdenesView.tsx
//
// Vista principal del módulo de Órdenes.
// Tabs horizontales: Cotizaciones | Órdenes
// Lista global con click → detalle (reutiliza OrdenDetailCard del módulo clientes)

import { PanelTabs } from "@/core/components/panel-shell/PanelTabs";
import { useEffect, useState } from "react";
import { NuevaOrdenButton } from "./NuevaOrdenButton";
import { EVENTO_ORDEN_CREADA } from "../hooks/useCartDrawerAdmin";
import { useRouter } from "@/i18n/navigation";
import { FinanzasToggle } from "./FinanzasToggle";
import { OrdenStatusFilter } from "./OrdenStatusFilter";
import { resumenProductos } from "@/core/helpers/ordenesResumen";
import { formatFechaCalendario } from "@/core/helpers/calendario";
import { ORDEN_STATUS_FINANZAS } from "@/modules/admin/store/domain/entities/Orden.entity";
import { useOrdenesGlobal } from "@/modules/admin/store/presentation/hooks/useOrdenesGlobal";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";
import { OrdenStatusBadge } from "./OrdenStatusBadge";

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
type Tab = "cotizaciones" | "ordenes" | "canceladas";

// Las canceladas (y las cotizaciones) tienen su propia pestaña: no entran en "Órdenes".
const TAB_STATUSES: Record<Tab, OrdenStatus[]> = {
  cotizaciones: ["cotizacion"],
  ordenes: ["en_proceso", "listo_entregar", "pagado", "entregado"],
  canceladas: ["cancelado"],
};

/** Sustantivo (singular, plural) de cada pestaña para los textos de conteo y vacío. */
const TAB_NOUN: Record<Tab, [string, string]> = {
  cotizaciones: ["cotización", "cotizaciones"],
  ordenes: ["orden", "órdenes"],
  canceladas: ["cancelada", "canceladas"],
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OrdenesView() {
  const router = useRouter();
  // "Órdenes" es siempre la pestaña inicial.
  const [tab, setTab] = useState<Tab>("ordenes");
  // Filtro por estatus (solo pestaña Órdenes). Vacío = todos los de la pestaña.
  const [statusSel, setStatusSel] = useState<OrdenStatus[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Pantallas pequeñas: búsqueda y filtros viven tras el botón de filtros.
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // El filtro por estatus lo resuelve el servidor (así la paginación es correcta por pestaña).
  const statusesFiltro =
    tab === "ordenes" && statusSel.length > 0 ? statusSel : TAB_STATUSES[tab];
  const {
    ordenes,
    total,
    totalPages,
    isLoading,
    error,
    setFinanzas,
    reload,
  } = useOrdenesGlobal({
    search,
    page,
    pageSize: 50,
    statuses: statusesFiltro,
  });

  // Una orden nueva desde el carrito aparece sin recargar la página.
  useEffect(() => {
    window.addEventListener(EVENTO_ORDEN_CREADA, reload);
    return () => window.removeEventListener(EVENTO_ORDEN_CREADA, reload);
  }, [reload]);

  const [finError, setFinError] = useState<string | null>(null);
  async function handleFinanzas(id: string, value: boolean) {
    setFinError(null);
    try {
      await setFinanzas(id, value);
    } catch (e: any) {
      setFinError(e.message);
    }
  }

  const [sing, plur] = TAB_NOUN[tab];

  function handleTabChange(t: Tab) {
    setTab(t);
    setPage(1);
    setSearch("");
    setStatusSel([]);
  }

  function handleStatusChange(next: OrdenStatus[]) {
    setStatusSel(next);
    setPage(1);
  }

  // Lo que el botón de filtros cuenta como aplicado (para no perderlo de vista con el panel cerrado).
  const filtrosActivos = (search.trim() ? 1 : 0) + statusSel.length;

  const inputCls =
    "w-full pl-4 pr-4 py-2.5 rounded-xl border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 placeholder:text-hc-soft";

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs y, en pantallas pequeñas, el botón que abre búsqueda y filtros */}
      <div className="flex items-center justify-between gap-3">
        <PanelTabs
          label="Tipo de pedido"
          tabs={[
            { value: "ordenes" as Tab, label: "Órdenes" },
            { value: "cotizaciones" as Tab, label: "Cotizaciones" },
            { value: "canceladas" as Tab, label: "Canceladas" },
          ]}
          value={tab}
          onChange={handleTabChange}
        />
        <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltrosAbiertos((v) => !v)}
          aria-expanded={filtrosAbiertos}
          aria-controls="ordenes-filtros"
          aria-label="Búsqueda y filtros"
          title="Búsqueda y filtros"
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition md:hidden ${
            filtrosAbiertos
              ? "border-hc-rose bg-hc-rose/5 text-hc-rose"
              : "border-hc-line-strong bg-white text-hc-muted hover:text-hc-ink"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18M7 12h10M10 18h4" />
          </svg>
          {filtrosActivos > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-hc-rose px-1 text-[10px] font-bold text-white">
              {filtrosActivos}
            </span>
          )}
        </button>
        <NuevaOrdenButton />
        </div>
      </div>

      {/* Búsqueda y filtro por estatus en una línea; en pantallas pequeñas,
          apilados y solo con el panel abierto. El filtro por estatus solo
          aplica a Órdenes (cotización y cancelado tienen su pestaña). */}
      <div
        id="ordenes-filtros"
        className={`${filtrosAbiertos ? "flex" : "hidden"} flex-col gap-3 md:flex md:flex-row md:items-center md:gap-4`}
      >
        <div className="relative min-w-0 flex-1">
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-hc-soft pointer-events-none">
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
        {tab === "ordenes" && (
          <OrdenStatusFilter
            opciones={TAB_STATUSES.ordenes}
            selected={statusSel}
            onChange={handleStatusChange}
          />
        )}
      </div>

      {/* Contador */}
      <p className="text-sm text-hc-muted">
        {isLoading
          ? "Cargando…"
          : `${total} ${total === 1 ? sing : plur}`}
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {finError && <p className="text-sm text-red-600">{finError}</p>}

      {/* Tabla desktop */}
      {!isLoading && (
        <div className="hidden md:block rounded-2xl border border-hc-line overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hc-hover border-b border-hc-line">
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  {tab === "cotizaciones" ? "Cotización" : "Orden"}
                </th>
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  Fecha
                </th>
                {tab === "ordenes" && (
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                    Estado
                  </th>
                )}
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-4 py-3 text-right  text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                  Items
                </th>
                {tab === "ordenes" && (
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                    Finanzas
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-line">
              {ordenes.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-hc-soft text-sm"
                  >
                    No hay {plur}{" "}
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
                  className="hover:bg-hc-hover/60 transition cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <p className="font-bold text-hc-ink">#{o.numero}</p>
                    <p className="text-[11px] text-hc-muted">
                      {fmtDate(o.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-hc-ink">
                      {o.clienteNombre ?? "Sin cliente"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-hc-soft/70 text-[13px]">
                    {fmtDate(o.createdAt)}
                  </td>
                  {tab === "ordenes" && (
                    <td className="px-4 py-3">
                      <OrdenStatusBadge status={o.status} />
                    </td>
                  )}
                  <td className="px-4 py-3 text-hc-soft/70 text-[13px]">
                    {o.fechaEntrega ? (
                      <>
                        {formatFechaCalendario(o.fechaEntrega)}
                        {o.horaEntrega && ` · ${o.horaEntrega}`}
                      </>
                    ) : (
                      <span className="text-hc-soft">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-hc-rose">
                    {fmtMoney(o.total)}
                  </td>
                  <td className="px-4 py-3 text-hc-ink text-[12px] max-w-[18rem]">
                    <p
                      className="line-clamp-3 break-words"
                      title={resumenProductos(o.items)}
                    >
                      {resumenProductos(o.items) || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center text-hc-muted text-[13px]">
                    {o.items.length}
                  </td>
                  {tab === "ordenes" && (
                    <td className="px-4 py-3 text-center">
                      {ORDEN_STATUS_FINANZAS.includes(o.status) ? (
                        <FinanzasToggle
                          checked={o.finanzas}
                          onChange={(v) => handleFinanzas(o.id, v)}
                          showLabel={false}
                        />
                      ) : (
                        <span className="text-hc-soft/50">—</span>
                      )}
                    </td>
                  )}
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
            <p className="text-center text-hc-soft text-sm py-8">
              No hay {plur}{" "}
              {search ? "con ese criterio" : "aún"}
            </p>
          )}
          {ordenes.map((o) => (
            <div
              key={o.id}
              onClick={() =>
                router.push(`/admin/dashboard/store/ordenes/${o.id}`)
              }
              className="bg-white rounded-2xl border border-hc-line p-4 shadow-sm cursor-pointer active:bg-hc-hover/60 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-hc-ink">
                    {tab === "cotizaciones" ? "Cotización" : "Orden"} #
                    {o.numero}
                  </p>
                  <p className="text-[12px] text-hc-muted">
                    {o.clienteNombre ?? "Sin cliente"}
                  </p>
                  {o.items.length > 0 && (
                    <p className="mt-1 text-[12px] text-hc-ink line-clamp-3 break-words">
                      {resumenProductos(o.items)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-hc-rose text-sm">
                    {fmtMoney(o.total)}
                  </span>
                  {tab === "ordenes" && <OrdenStatusBadge status={o.status} />}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-hc-muted">
                <span>{fmtDate(o.createdAt)}</span>
                {o.fechaEntrega ? (
                  <span>
                    Entrega: {formatFechaCalendario(o.fechaEntrega)}
                    {o.horaEntrega && ` · ${o.horaEntrega}`}
                  </span>
                ) : (
                  <span>
                    {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {tab === "ordenes" && ORDEN_STATUS_FINANZAS.includes(o.status) && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-hc-line">
                  <span className="text-[11px] text-hc-muted">
                    Cuenta en finanzas
                  </span>
                  <FinanzasToggle
                    checked={o.finanzas}
                    onChange={(v) => handleFinanzas(o.id, v)}
                    showLabel={false}
                  />
                </div>
              )}
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
            className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-soft text-sm hover:bg-hc-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-hc-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-soft text-sm hover:bg-hc-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
