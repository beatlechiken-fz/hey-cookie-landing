"use client";
// src/modules/admin/clientes/presentation/components/OrdenDetailCard.tsx

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Orden,
  OrdenItem,
  OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import {
  ORDEN_STATUS_LABELS,
  ORDEN_STATUS_EDITABLES,
  ORDEN_STATUS_FINANZAS,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import { FinanzasToggle } from "./FinanzasToggle";
import { OrdenStatusBadge } from "./OrdenStatusBadge";
import { resumenProductos } from "@/core/helpers/ordenesResumen";
import { formatFechaCalendario } from "@/core/helpers/calendario";
import type { ClienteResumen } from "@/modules/admin/store/domain/entities/Cliente.entity";
import { OrdenPipeline } from "./OrdenPipeline";
import { OrdenPagosSection, type PagoCompartido } from "./OrdenPagosSection";
import { PastelCompartidoSection } from "./PastelCompartidoSection";
import type { PastelCompartido } from "@/modules/admin/store/domain/entities/PastelCompartido.entity";
import {
  generarCotizacionPdf,
  generarComandaPdf,
} from "@/core/helpers/generarPDF";
import {
  resolveOrigen,
  type CartItem,
  type CartItemOrigen,
} from "@/modules/admin/store/presentation/hooks/useCartStore";
import { PastelConfiguradorModal } from "./configurador/PastelConfiguradorModal";
import { GelatinaCotizadorModal } from "./configurador/GelatinaCotizadorModal";
import { PersonalizadoConfiguradorModal } from "./configurador/PersonalizadoConfiguradorModal";
import { ProductoConfiguradorModal } from "./ProductoConfiguradorModal";
import { ProductoPickerModal } from "./ProductoPickerModal";
import {
  AgregarItemCustomModal,
  type AddItemPayload,
} from "./AgregarItemCustomModal";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

interface Props {
  orden: Orden;
  onUpdateStatus: (
    id: string,
    status: OrdenStatus,
    descontarInventario?: boolean,
  ) => Promise<void>;
  /** Refresca la orden desde el padre — se llama tras editar/quitar una partida. */
  onRefresh: () => void;
  /** Empieza expandida (p. ej. en la página de detalle de una orden). Por defecto colapsada. */
  defaultExpanded?: boolean;
}

/** Adapta un OrdenItem (persistido) al shape de CartItem para reutilizar
 *  resolveOrigen() y los modales de configurador ya existentes. `origen` se
 *  omite a propósito: orden_items nunca lo persiste, siempre se infiere. */
function toCartItemShape(item: OrdenItem): CartItem {
  return {
    id: item.id ?? "",
    nombre: item.nombre,
    configuracion: item.configuracion,
    cantidad: item.cantidad,
    costoUnitario: item.costoUnitario,
    precioUnitario: item.precioUnitario,
    desgloseCostos: item.desgloseCostos ?? null,
    observaciones: item.observaciones ?? null,
    cuponesItem: [],
  } as unknown as CartItem;
}

/** Solo estos 3 orígenes tienen un modal admin que reabrir. */
const ORIGENES_ADMIN_EDITABLES: CartItemOrigen[] = [
  "pastel-configurador",
  "gelatina-configurador",
  "producto-configurador",
];

const NEXT_STATUS: Record<OrdenStatus, OrdenStatus | null> = {
  cotizacion: "en_proceso",
  en_proceso: "listo_entregar",
  listo_entregar: "pagado",
  pagado: "entregado",
  entregado: null,
  cancelado: null,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrdenDetailCard({
  orden,
  onUpdateStatus,
  onRefresh,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [editingFecha, setEditingFecha] = useState(false);
  const [fechaInput, setFechaInput] = useState(
    orden.fechaEntrega?.slice(0, 10) ?? "",
  );
  const [horaInput, setHoraInput] = useState(orden.horaEntrega ?? "");
  const [savingFecha, setSavingFecha] = useState(false);

  // ── Asignar cliente a una orden que todavía no tiene uno ──────────────────
  const [asignandoCliente, setAsignandoCliente] = useState(false);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteResults, setClienteResults] = useState<ClienteResumen[]>([]);
  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [savingCliente, setSavingCliente] = useState(false);

  useEffect(() => {
    if (!clienteSearchOpen) return;
    const q = clienteSearch.trim();
    let active = true;
    setClienteLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/clientes/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          if (active) setClienteResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (active) setClienteResults([]);
        })
        .finally(() => {
          if (active) setClienteLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [clienteSearch, clienteSearchOpen]);

  async function handleAsignarCliente(clienteId: string) {
    setSavingCliente(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ordenes/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "No se pudo asignar el cliente");
      }
      setAsignandoCliente(false);
      setClienteSearch("");
      setClienteSearchOpen(false);
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingCliente(false);
    }
  }

  // ── Descontar inventario al pasar a "en_proceso" ──────────────────────────
  const tieneProductosInventariables = orden.items.some(
    (i) => (i.configuracion as Record<string, any> | null)?.productoId,
  );
  const [descontarInv, setDescontarInv] = useState(true);

  // ── Editar / quitar partidas de la orden ──────────────────────────────────
  const puedeEditarItems = ORDEN_STATUS_EDITABLES.includes(orden.status);
  const [editingOrdenItem, setEditingOrdenItem] = useState<OrdenItem | null>(null);
  const [editingOrigen, setEditingOrigen] = useState<
    | "pastel-configurador"
    | "gelatina-configurador"
    | "personalizado-configurador"
    | "producto-configurador"
    | null
  >(null);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  // Línea personalizada (sin configurador) que se está editando.
  const [editingCustom, setEditingCustom] = useState<OrdenItem | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  // ── Pasteles para compartir (Arma tu pedido) ──────────────────────────────
  const itemsCompartir = orden.items.filter(
    (i) => i.id && (i.configuracion as { compartir?: boolean } | null)?.compartir,
  );
  const [compartidos, setCompartidos] = useState<PastelCompartido[]>([]);
  const cargarCompartidos = useCallback(async () => {
    const res = await fetch(`/api/admin/ordenes/${orden.id}/compartir`);
    if (res.ok) setCompartidos(await res.json());
  }, [orden.id]);
  useEffect(() => {
    if (expanded && itemsCompartir.length > 0) cargarCompartidos();
  }, [expanded, itemsCompartir.length, cargarCompartidos]);

  // Cada enlace cubre la parte proporcional del total que le toca a su partida
  // (si el pastel es lo único en la orden, es el total completo).
  const pagosCompartidos: PagoCompartido[] = compartidos.flatMap((c) => {
    const item = orden.items.find((i) => i.id === c.ordenItemId);
    if (!item) return [];
    const monto =
      orden.subtotal > 0 ? (item.subtotal / orden.subtotal) * orden.total : orden.total;
    return [{ compartido: c, monto }];
  });

  function closeEditModal() {
    setEditingOrdenItem(null);
    setEditingOrigen(null);
    setEditProducto(null);
  }

  // ── Marcar la venta para finanzas ─────────────────────────────────────────
  const puedeMarcarFinanzas = ORDEN_STATUS_FINANZAS.includes(orden.status);

  async function handleToggleFinanzas(next: boolean) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/ordenes/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finanzas: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "No se pudo actualizar finanzas");
      }
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  // ── Observaciones por producto (edición en línea) ─────────────────────────
  const [editingObsId, setEditingObsId] = useState<string | null>(null);
  const [obsDraft, setObsDraft] = useState("");
  const [savingObs, setSavingObs] = useState(false);

  function startEditObs(item: OrdenItem) {
    setItemError(null);
    setObsDraft(item.observaciones ?? "");
    setEditingObsId(item.id ?? null);
  }

  async function handleSaveObs(itemId: string) {
    setSavingObs(true);
    setItemError(null);
    try {
      const res = await fetch(
        `/api/admin/ordenes/${orden.id}/items/${itemId}/observaciones`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ observaciones: obsDraft.trim() || null }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "No se pudieron guardar las observaciones");
      }
      setEditingObsId(null);
      onRefresh();
    } catch (e: any) {
      setItemError(e.message);
    } finally {
      setSavingObs(false);
    }
  }

  // ── Agregar partida nueva a la orden ───────────────────────────────────────
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addingOrigen, setAddingOrigen] = useState<
    | "pastel-configurador"
    | "gelatina-configurador"
    | "personalizado-configurador"
    | "custom"
    | null
  >(null);
  const [pickingProducto, setPickingProducto] = useState(false);
  const [addingProducto, setAddingProducto] = useState<Producto | null>(null);

  async function handleAddItem(payload: AddItemPayload) {
    const res = await fetch(`/api/admin/ordenes/${orden.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: payload.nombre,
        configuracion: payload.configuracion,
        cantidad: payload.cantidad,
        costoUnitario: payload.costoUnitario,
        precioUnitario: payload.precioUnitario,
        desgloseCostos: payload.desgloseCostos ?? null,
        observaciones: payload.observaciones,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Error al agregar el producto");
    }
    onRefresh();
  }

  async function handleEditItem(item: OrdenItem) {
    setItemError(null);
    const origen = resolveOrigen(toCartItemShape(item));

    if (origen === "producto-configurador") {
      // any: configuracion sin tipo dedicado — mismo patrón que en los modales de carrito.
      const productoId = (item.configuracion as Record<string, any>)?.productoId;
      if (!productoId) {
        setItemError("No se pudo determinar el producto de esta partida.");
        return;
      }
      setLoadingEdit(true);
      try {
        const res = await fetch(`/api/admin/productos/${productoId}`);
        if (!res.ok) throw new Error();
        setEditProducto(await res.json());
        setEditingOrigen("producto-configurador");
        setEditingOrdenItem(item);
      } catch {
        setItemError("No se pudo cargar el producto de esta partida.");
      } finally {
        setLoadingEdit(false);
      }
      return;
    }

    if (
      origen === "pastel-configurador" ||
      origen === "gelatina-configurador" ||
      origen === "personalizado-configurador"
    ) {
      setEditingOrigen(origen);
      setEditingOrdenItem(item);
      return;
    }

    // Línea personalizada (sin configurador): se edita con su propio modal.
    if (origen === null) {
      setEditingCustom(item);
      return;
    }

    setItemError("Esta partida no se puede editar desde aquí.");
  }

  async function handleSaveCustom(payload: AddItemPayload) {
    if (!editingCustom?.id) return;
    const res = await fetch(
      `/api/admin/ordenes/${orden.id}/items/${editingCustom.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: payload.nombre,
          configuracion: editingCustom.configuracion,
          cantidad: payload.cantidad,
          costoUnitario: payload.costoUnitario,
          precioUnitario: payload.precioUnitario,
          desgloseCostos: editingCustom.desgloseCostos ?? null,
          observaciones: payload.observaciones ?? null,
        }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Error al guardar el cambio");
    }
    onRefresh();
  }

  async function handleSaveItem(payload: Omit<CartItem, "id" | "origen">) {
    if (!editingOrdenItem?.id) return;
    const res = await fetch(
      `/api/admin/ordenes/${orden.id}/items/${editingOrdenItem.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: payload.nombre,
          configuracion: payload.configuracion,
          cantidad: payload.cantidad,
          costoUnitario: payload.costoUnitario,
          precioUnitario: payload.precioUnitario,
          desgloseCostos: payload.desgloseCostos ?? null,
          observaciones: payload.observaciones,
        }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? "Error al guardar el cambio");
    }
    onRefresh();
  }

  async function handleRemoveItem(itemId: string) {
    setRemovingId(itemId);
    setItemError(null);
    try {
      const res = await fetch(`/api/admin/ordenes/${orden.id}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Error al quitar el producto");
      }
      setConfirmRemoveId(null);
      onRefresh();
    } catch (e: any) {
      setItemError(e.message);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleSaveFecha() {
    setSavingFecha(true);
    setError(null);
    try {
      await fetch(`/api/admin/ordenes/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaEntrega: fechaInput || null,
          horaEntrega: fechaInput ? horaInput || null : null,
        }),
      });
      setEditingFecha(false);
      // Recargar la orden para reflejar el cambio
      onUpdateStatus(orden.id, orden.status);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingFecha(false);
    }
  }

  async function handlePdfCotizacion() {
    setGenerandoPdf(true);
    try {
      await generarCotizacionPdf(orden);
    } catch (e: any) {
      setError(`Error al generar PDF: ${e.message}`);
    } finally {
      setGenerandoPdf(false);
    }
  }

  async function handlePdfComanda() {
    setGenerandoPdf(true);
    try {
      await generarComandaPdf(orden.id, orden.numero);
    } catch (e: any) {
      setError(`Error al generar comanda: ${e.message}`);
    } finally {
      setGenerandoPdf(false);
    }
  }

  const nextStatus = NEXT_STATUS[orden.status];
  // Productos en una línea para ubicar la orden sin expandirla (igual que en la lista de órdenes).
  const productos = resumenProductos(orden.items);

  async function handleAdvance() {
    if (!nextStatus) return;
    setUpdating(true);
    setError(null);
    try {
      await onUpdateStatus(
        orden.id,
        nextStatus,
        nextStatus === "en_proceso" ? descontarInv : undefined,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    setUpdating(true);
    setError(null);
    try {
      await onUpdateStatus(orden.id, "cancelado");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
    <div className="rounded-2xl border border-hc-line bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-hc-hover/60 transition"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-bold text-hc-ink text-sm">
              {orden.status === "cotizacion" ? "Cotización" : "Orden"} #
              {orden.numero}
            </p>
            <OrdenStatusBadge status={orden.status} />
          </div>
          {productos && (
            <p
              className="mt-1 truncate text-[12.5px] text-hc-ink/80"
              title={productos}
            >
              {productos}
            </p>
          )}
          <p className="mt-0.5 text-[11px] text-hc-muted">
            {formatDate(orden.createdAt)}
            {orden.fechaEntrega && (
              <span className="text-hc-rose font-medium">
                {" · "}🎂 Entrega: {formatFechaCalendario(orden.fechaEntrega)}
                {orden.horaEntrega && ` ${orden.horaEntrega}`}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <p className="font-bold text-hc-rose text-sm">
            ${orden.total.toFixed(2)}
          </p>
          <svg
            viewBox="0 0 24 24"
            className={
              "w-4 h-4 text-hc-muted transition-transform " +
              (expanded ? "rotate-180" : "")
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-4 border-t border-hc-line pt-4">
              {/* Pipeline */}
              <div className="flex justify-center overflow-x-auto py-1">
                <OrdenPipeline status={orden.status} />
              </div>

              {/* Cliente */}
              <div className="relative rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
                <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Cliente
                </p>
                {orden.clienteNombre ? (
                  <p className="text-[13px] font-semibold text-hc-ink mt-0.5">
                    {orden.clienteNombre}
                  </p>
                ) : asignandoCliente ? (
                  <div className="mt-1.5">
                    <input
                      autoFocus
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        setClienteSearchOpen(true);
                      }}
                      onFocus={() => setClienteSearchOpen(true)}
                      placeholder="Buscar cliente por nombre, teléfono o email…"
                      className="w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition placeholder:text-hc-soft"
                    />
                    {clienteSearchOpen && (
                      <div className="absolute left-3 right-3 mt-1 rounded-xl border border-hc-line bg-white shadow-lg z-10 overflow-hidden max-h-52 overflow-y-auto">
                        {clienteLoading && (
                          <p className="px-3 py-2.5 text-[12px] text-hc-soft">Buscando…</p>
                        )}
                        {!clienteLoading && clienteResults.length === 0 && (
                          <p className="px-3 py-2.5 text-[12px] text-hc-soft">
                            {clienteSearch.trim() ? "Sin resultados" : "Escribe para buscar un cliente"}
                          </p>
                        )}
                        {!clienteLoading &&
                          clienteResults.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              disabled={savingCliente}
                              onClick={() => handleAsignarCliente(c.id)}
                              className="w-full text-left px-3 py-2.5 hover:bg-hc-hover transition border-b border-hc-line last:border-b-0 disabled:opacity-50"
                            >
                              <p className="text-[13px] font-semibold text-hc-ink">{c.nombre}</p>
                              {(c.telefono || c.email) && (
                                <p className="text-[11px] text-hc-muted">
                                  {[c.telefono, c.email].filter(Boolean).join(" · ")}
                                </p>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAsignandoCliente(false);
                        setClienteSearchOpen(false);
                        setClienteSearch("");
                      }}
                      className="mt-1.5 text-[11px] font-semibold text-hc-muted hover:text-hc-rose transition"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[13px] text-hc-soft font-normal">Sin cliente asignado</span>
                    <button
                      onClick={() => setAsignandoCliente(true)}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-hc-rose text-white text-[11px] font-bold hover:bg-hc-rose-hover transition"
                    >
                      Asignar cliente
                    </button>
                  </div>
                )}
              </div>

              {/* Fecha de entrega */}
              <div className="flex items-center justify-between rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
                <div>
                  <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                    Fecha de entrega
                  </p>
                  {editingFecha ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="date"
                        value={fechaInput}
                        onChange={(e) => setFechaInput(e.target.value)}
                        className="text-sm border border-hc-line-strong rounded-lg px-2 py-1 text-hc-ink focus:outline-none focus:border-hc-rose"
                      />
                      <input
                        type="time"
                        value={horaInput}
                        onChange={(e) => setHoraInput(e.target.value)}
                        disabled={!fechaInput}
                        className="text-sm border border-hc-line-strong rounded-lg px-2 py-1 text-hc-ink focus:outline-none focus:border-hc-rose disabled:bg-hc-sunken disabled:text-hc-soft/50"
                      />
                      <button
                        onClick={handleSaveFecha}
                        disabled={savingFecha}
                        className="px-2.5 py-1 rounded-lg bg-hc-rose text-white text-[11px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
                      >
                        {savingFecha ? "…" : "Guardar"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingFecha(false);
                          setFechaInput(orden.fechaEntrega?.slice(0, 10) ?? "");
                          setHoraInput(orden.horaEntrega ?? "");
                        }}
                        className="px-2 py-1 rounded-lg border border-hc-line-strong text-hc-muted text-[11px] hover:bg-hc-sunken transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-[13px] font-semibold text-hc-ink mt-0.5">
                      {orden.fechaEntrega ? (
                        <>
                          {formatFechaCalendario(orden.fechaEntrega)}
                          {orden.horaEntrega && (
                            <span className="text-hc-soft font-normal">
                              {" "}· {orden.horaEntrega}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-hc-soft font-normal">
                          Sin fecha asignada
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {!editingFecha && (
                  <button
                    onClick={() => setEditingFecha(true)}
                    className="p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Observaciones / alergias */}
              {orden.notas && (
                <div className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                    Observaciones
                  </p>
                  <p className="text-[13px] text-hc-ink mt-0.5 whitespace-pre-wrap">
                    {orden.notas}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Productos
                  </p>
                  {puedeEditarItems && (
                    <div className="relative">
                      <button
                        onClick={() => setAddMenuOpen((v) => !v)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-hc-line-strong text-hc-soft text-[11px] font-semibold hover:bg-hc-hover transition"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Agregar producto
                      </button>
                      {addMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setAddMenuOpen(false)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-hc-line bg-white shadow-lg overflow-hidden">
                            {[
                              {
                                label: "Pastel personalizado",
                                onClick: () => setAddingOrigen("pastel-configurador"),
                              },
                              {
                                label: "Gelatina",
                                onClick: () => setAddingOrigen("gelatina-configurador"),
                              },
                              {
                                label: "Armado personalizado",
                                onClick: () => setAddingOrigen("personalizado-configurador"),
                              },
                              {
                                label: "Producto de catálogo",
                                onClick: () => setPickingProducto(true),
                              },
                              {
                                label: "Línea personalizada",
                                onClick: () => setAddingOrigen("custom"),
                              },
                            ].map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => {
                                  setAddMenuOpen(false);
                                  opt.onClick();
                                }}
                                className="w-full text-left px-3 py-2.5 text-[13px] text-hc-ink hover:bg-hc-hover transition"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {itemError && (
                  <p className="text-[12px] text-[#C0392B] bg-[#FCE9EA] border border-[#f5c6c8] rounded-lg px-3 py-2">
                    {itemError}
                  </p>
                )}
                {orden.items.map((item, i) => {
                  const origenItem = resolveOrigen(toCartItemShape(item));
                  const editable =
                    puedeEditarItems &&
                    (origenItem === null ||
                      ORIGENES_ADMIN_EDITABLES.includes(origenItem));
                  const removible = puedeEditarItems && orden.items.length > 1;
                  const confirming = confirmRemoveId === item.id;

                  return (
                    <div
                      key={item.id ?? i}
                      className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-hc-ink truncate">
                            {item.nombre}
                          </p>
                          <p className="text-[11px] text-hc-muted">
                            {item.cantidad} × ${item.precioUnitario.toFixed(2)}
                            {(item.configuracion as any)?.diametroCm
                              ? ` · ${(item.configuracion as any).diametroCm}cm`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {editable && !confirming && (
                            <button
                              onClick={() => handleEditItem(item)}
                              disabled={loadingEdit}
                              className="p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition disabled:opacity-50"
                              aria-label="Editar"
                              title="Editar"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                          {removible && !confirming && (
                            <button
                              onClick={() => setConfirmRemoveId(item.id ?? null)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-hc-muted hover:text-red-600 transition"
                              aria-label="Quitar"
                              title="Quitar"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          )}
                          <p className="font-bold text-hc-rose text-sm">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {editingObsId === item.id ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <textarea
                            value={obsDraft}
                            onChange={(e) => setObsDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setEditingObsId(null);
                              if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                                handleSaveObs(item.id!);
                            }}
                            rows={3}
                            maxLength={1000}
                            autoFocus
                            aria-label={`Observaciones de ${item.nombre}`}
                            placeholder="Observaciones / descripción detallada del producto"
                            className="w-full resize-none rounded-lg border border-hc-line-strong bg-white px-2.5 py-1.5 text-[12px] text-hc-ink placeholder:text-hc-soft/60 focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingObsId(null)}
                              className="px-2.5 py-1 rounded-lg border border-hc-line-strong text-hc-muted text-[11px] hover:bg-white transition"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveObs(item.id!)}
                              disabled={savingObs}
                              className="px-2.5 py-1 rounded-lg bg-hc-rose text-white text-[11px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
                            >
                              {savingObs ? "Guardando…" : "Guardar"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {item.observaciones && (
                            <p className="mt-1.5 text-[12px] text-hc-muted whitespace-pre-wrap break-words">
                              {item.observaciones}
                            </p>
                          )}
                          {item.id && !confirming && (
                            <button
                              onClick={() => startEditObs(item)}
                              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-hc-line-strong bg-white text-[11px] font-semibold text-hc-soft hover:text-hc-rose hover:border-hc-rose transition"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6M8 13h8M8 17h5" />
                              </svg>
                              {item.observaciones
                                ? "Editar observaciones"
                                : "Agregar observaciones"}
                            </button>
                          )}
                        </>
                      )}
                      {item.id &&
                        (item.configuracion as { compartir?: boolean } | null)?.compartir && (
                          <PastelCompartidoSection
                            ordenId={orden.id}
                            ordenItemId={item.id}
                            compartido={
                              compartidos.find((c) => c.ordenItemId === item.id) ?? null
                            }
                            onChange={cargarCompartidos}
                          />
                        )}
                      {confirming && (
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-hc-line-strong">
                          <span className="text-[12px] text-hc-muted">
                            ¿Quitar este producto de la orden?
                          </span>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setConfirmRemoveId(null)}
                              className="px-2.5 py-1 rounded-lg border border-hc-line-strong text-hc-muted text-[11px] hover:bg-white transition"
                            >
                              No
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id!)}
                              disabled={removingId === item.id}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 disabled:opacity-50 transition"
                            >
                              {removingId === item.id ? "Quitando…" : "Sí, quitar"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cupones */}
              {orden.cupones.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Cupones aplicados
                  </p>
                  {orden.cupones.map((c, i) => (
                    <div
                      key={c.id ?? i}
                      className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2"
                    >
                      <span className="text-[13px] font-semibold text-green-700">
                        {c.codigo}
                      </span>
                      <span className="text-[12px] text-green-600">
                        −${c.montoDescontado.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales */}
              <div className="flex flex-col gap-1 pt-1 border-t border-hc-line">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-hc-muted">Subtotal</span>
                  <span className="text-hc-ink">
                    ${orden.subtotal.toFixed(2)}
                  </span>
                </div>
                {orden.descuentoTotal - orden.cashbackAplicado > 0.005 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-green-600">Descuento</span>
                    <span className="text-green-600">
                      −${(orden.descuentoTotal - orden.cashbackAplicado).toFixed(2)}
                    </span>
                  </div>
                )}
                {orden.cashbackAplicado > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-green-600">Cashback del cliente</span>
                    <span className="text-green-600">
                      −${orden.cashbackAplicado.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-hc-soft">Total</span>
                  <span className="font-bold text-hc-rose text-lg">
                    ${orden.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {puedeMarcarFinanzas && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
                  <p className="text-[12px] text-hc-muted">
                    <span className="font-semibold text-hc-ink">Finanzas</span>
                    {" "}— cuenta esta venta en los dashboards de finanzas.
                  </p>
                  <FinanzasToggle
                    checked={orden.finanzas}
                    onChange={handleToggleFinanzas}
                    showLabel={false}
                  />
                </div>
              )}

              {orden.inventarioDescontado && (
                <p className="flex items-center gap-1.5 text-[11px] text-hc-muted/70">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                  </svg>
                  Esta orden ya descontó inventario — se restaura solo si se cancela.
                </p>
              )}

              {/* Pagos parciales */}
              <OrdenPagosSection
                ordenId={orden.id}
                ordenTotal={orden.total}
                status={orden.status}
                compartidos={pagosCompartidos}
              />

              {error && (
                <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Toggle de inventario — solo antes de pasar a "en_proceso" */}
              {orden.status === "cotizacion" &&
                nextStatus === "en_proceso" &&
                tieneProductosInventariables && (
                  <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-hc-hover border border-hc-line cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={descontarInv}
                      onChange={(e) => setDescontarInv(e.target.checked)}
                      className="w-4 h-4 accent-hc-rose cursor-pointer"
                    />
                    <span className="text-[12px] text-hc-muted">
                      <span className="font-semibold text-hc-ink">
                        Descontar de inventario
                      </span>{" "}
                      al generar la orden — resta del stock los productos de
                      catálogo que trae esta cotización.
                    </span>
                  </label>
                )}

              {/* Acciones de pipeline */}
              {orden.status !== "entregado" && orden.status !== "cancelado" && (
                <div className="flex gap-2">
                  {nextStatus && (
                    <button
                      onClick={handleAdvance}
                      disabled={updating}
                      className="flex-1 py-2 rounded-xl bg-hc-rose text-white text-[13px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
                    >
                      {updating
                        ? "Actualizando…"
                        : `Mover a "${ORDEN_STATUS_LABELS[nextStatus]}"`}
                    </button>
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Botones PDF */}
              <div className="flex gap-2 pt-1">
                {/* Cotización (solo si status = cotizacion) u Orden (si en_proceso) */}
                {(orden.status === "cotizacion" ||
                  orden.status === "en_proceso") && (
                  <button
                    onClick={handlePdfCotizacion}
                    disabled={generandoPdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-hc-line-strong text-hc-soft text-[12px] font-semibold hover:bg-hc-hover disabled:opacity-50 transition"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="m14 2 4 4H14V2z" />
                      <path d="M10 12h4M10 16h4M10 8h1" />
                    </svg>
                    {generandoPdf
                      ? "Generando…"
                      : orden.status === "cotizacion"
                        ? "Generar cotización PDF"
                        : "Generar orden PDF"}
                  </button>
                )}
                {/* Comanda siempre disponible */}
                <button
                  onClick={handlePdfComanda}
                  disabled={generandoPdf}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-hc-line-strong bg-hc-hover text-hc-soft text-[12px] font-semibold hover:bg-hc-sunken disabled:opacity-50 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="9" y="2" width="6" height="4" rx="1" />
                    <path d="M9 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-4" />
                    <path d="M7 13h10M7 17h5" />
                  </svg>
                  {generandoPdf ? "Generando…" : "Generar comanda"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Modales de edición de partida — reabren el configurador correcto */}
    <PastelConfiguradorModal
      open={editingOrigen === "pastel-configurador"}
      onClose={closeEditModal}
      editItem={editingOrigen === "pastel-configurador" ? toCartItemShape(editingOrdenItem!) : null}
      onSave={handleSaveItem}
    />
    <GelatinaCotizadorModal
      open={editingOrigen === "gelatina-configurador"}
      onClose={closeEditModal}
      editItem={editingOrigen === "gelatina-configurador" ? toCartItemShape(editingOrdenItem!) : null}
      onSave={handleSaveItem}
    />
    <PersonalizadoConfiguradorModal
      open={editingOrigen === "personalizado-configurador"}
      onClose={closeEditModal}
      editItem={editingOrigen === "personalizado-configurador" ? toCartItemShape(editingOrdenItem!) : null}
      onSave={handleSaveItem}
    />
    <ProductoConfiguradorModal
      producto={editingOrigen === "producto-configurador" ? editProducto : null}
      onClose={closeEditModal}
      editItem={editingOrigen === "producto-configurador" && editingOrdenItem ? toCartItemShape(editingOrdenItem) : null}
      onSave={handleSaveItem}
    />

    {/* Modales de agregar partida nueva — sin editItem, los configuradores caen en modo "crear" */}
    <PastelConfiguradorModal
      open={addingOrigen === "pastel-configurador"}
      onClose={() => setAddingOrigen(null)}
      onSave={handleAddItem}
    />
    <GelatinaCotizadorModal
      open={addingOrigen === "gelatina-configurador"}
      onClose={() => setAddingOrigen(null)}
      onSave={handleAddItem}
    />
    <PersonalizadoConfiguradorModal
      open={addingOrigen === "personalizado-configurador"}
      onClose={() => setAddingOrigen(null)}
      onSave={handleAddItem}
    />
    <ProductoPickerModal
      open={pickingProducto}
      onClose={() => setPickingProducto(false)}
      onSelect={(p) => {
        setPickingProducto(false);
        setAddingProducto(p);
      }}
    />
    <ProductoConfiguradorModal
      producto={addingProducto}
      onClose={() => setAddingProducto(null)}
      onSave={handleAddItem}
    />
    {editingCustom && (
      <AgregarItemCustomModal
        key={editingCustom.id}
        open
        onClose={() => setEditingCustom(null)}
        onSave={handleSaveCustom}
        initial={{
          nombre: editingCustom.nombre,
          cantidad: editingCustom.cantidad,
          costoUnitario: editingCustom.costoUnitario,
          precioUnitario: editingCustom.precioUnitario,
          observaciones: editingCustom.observaciones ?? "",
        }}
      />
    )}
    <AgregarItemCustomModal
      open={addingOrigen === "custom"}
      onClose={() => setAddingOrigen(null)}
      onSave={handleAddItem}
    />
    </>
  );
}
