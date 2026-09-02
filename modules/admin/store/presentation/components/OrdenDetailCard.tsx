"use client";
// src/modules/admin/clientes/presentation/components/OrdenDetailCard.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Orden,
  OrdenItem,
  OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import {
  ORDEN_STATUS_LABELS,
  ORDEN_STATUS_EDITABLES,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import { OrdenPipeline } from "./OrdenPipeline";
import { OrdenPagosSection } from "./OrdenPagosSection";
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
import { ProductoConfiguradorModal } from "./ProductoConfiguradorModal";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

interface Props {
  orden: Orden;
  onUpdateStatus: (id: string, status: OrdenStatus) => Promise<void>;
  /** Refresca la orden desde el padre — se llama tras editar/quitar una partida. */
  onRefresh: () => void;
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

export function OrdenDetailCard({ orden, onUpdateStatus, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [editingFecha, setEditingFecha] = useState(false);
  const [fechaInput, setFechaInput] = useState(
    orden.fechaEntrega?.slice(0, 10) ?? "",
  );
  const [savingFecha, setSavingFecha] = useState(false);

  // ── Editar / quitar partidas de la orden ──────────────────────────────────
  const puedeEditarItems = ORDEN_STATUS_EDITABLES.includes(orden.status);
  const [editingOrdenItem, setEditingOrdenItem] = useState<OrdenItem | null>(null);
  const [editingOrigen, setEditingOrigen] = useState<
    "pastel-configurador" | "gelatina-configurador" | "producto-configurador" | null
  >(null);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  function closeEditModal() {
    setEditingOrdenItem(null);
    setEditingOrigen(null);
    setEditProducto(null);
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

    if (origen === "pastel-configurador" || origen === "gelatina-configurador") {
      setEditingOrigen(origen);
      setEditingOrdenItem(item);
      return;
    }

    setItemError("Esta partida no se puede editar desde aquí.");
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
        body: JSON.stringify({ fechaEntrega: fechaInput || null }),
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

  async function handleAdvance() {
    if (!nextStatus) return;
    setUpdating(true);
    setError(null);
    try {
      await onUpdateStatus(orden.id, nextStatus);
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
    <div className="rounded-2xl border border-[#f0e0d0] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FFF7F0]/60 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <p className="font-bold text-[#3d1a24] text-sm">
              {orden.status === "cotizacion" ? "Cotización" : "Orden"} #
              {orden.numero}
            </p>
            <p className="text-[11px] text-[#6B3E26]">
              {formatDate(orden.createdAt)}
            </p>
            {orden.fechaEntrega && (
              <p className="text-[11px] text-[#c0607a] font-medium mt-0.5">
                🎂 Entrega: {formatDate(orden.fechaEntrega)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-bold text-[#c0607a] text-sm">
            ${orden.total.toFixed(2)}
          </p>
          <svg
            viewBox="0 0 24 24"
            className={
              "w-4 h-4 text-[#6B3E26] transition-transform " +
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
            <div className="px-4 pb-4 flex flex-col gap-4 border-t border-[#f9eef2] pt-4">
              {/* Pipeline */}
              <div className="flex justify-center overflow-x-auto py-1">
                <OrdenPipeline status={orden.status} />
              </div>

              {/* Fecha de entrega */}
              <div className="flex items-center justify-between rounded-xl bg-[#FFF7F0] border border-[#f0e0d0] px-3 py-2.5">
                <div>
                  <p className="text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                    Fecha de entrega
                  </p>
                  {editingFecha ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="date"
                        value={fechaInput}
                        onChange={(e) => setFechaInput(e.target.value)}
                        className="text-sm border border-[#e8c4a0] rounded-lg px-2 py-1 text-[#3d1a24] focus:outline-none focus:border-[#c0607a]"
                      />
                      <button
                        onClick={handleSaveFecha}
                        disabled={savingFecha}
                        className="px-2.5 py-1 rounded-lg bg-[#c0607a] text-white text-[11px] font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                      >
                        {savingFecha ? "…" : "Guardar"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingFecha(false);
                          setFechaInput(orden.fechaEntrega?.slice(0, 10) ?? "");
                        }}
                        className="px-2 py-1 rounded-lg border border-[#e8c4a0] text-[#6B3E26] text-[11px] hover:bg-[#f0e0d0] transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-[13px] font-semibold text-[#3d1a24] mt-0.5">
                      {orden.fechaEntrega ? (
                        formatDate(orden.fechaEntrega)
                      ) : (
                        <span className="text-[#AA6A42] font-normal">
                          Sin fecha asignada
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {!editingFecha && (
                  <button
                    onClick={() => setEditingFecha(true)}
                    className="p-1.5 rounded-lg hover:bg-[#f0e0d0] text-[#6B3E26] hover:text-[#c0607a] transition"
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
                <div className="rounded-xl bg-[#FFF7F0] border border-[#f0e0d0] px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                    Observaciones
                  </p>
                  <p className="text-[13px] text-[#3d1a24] mt-0.5 whitespace-pre-wrap">
                    {orden.notas}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                  Productos
                </p>
                {itemError && (
                  <p className="text-[12px] text-[#C0392B] bg-[#FCE9EA] border border-[#f5c6c8] rounded-lg px-3 py-2">
                    {itemError}
                  </p>
                )}
                {orden.items.map((item, i) => {
                  const origenItem = resolveOrigen(toCartItemShape(item));
                  const editable =
                    puedeEditarItems &&
                    origenItem &&
                    ORIGENES_ADMIN_EDITABLES.includes(origenItem);
                  const removible = puedeEditarItems && orden.items.length > 1;
                  const confirming = confirmRemoveId === item.id;

                  return (
                    <div
                      key={item.id ?? i}
                      className="rounded-xl bg-[#FFF7F0] border border-[#f0e0d0] px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#3d1a24] truncate">
                            {item.nombre}
                          </p>
                          <p className="text-[11px] text-[#6B3E26]">
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
                              className="p-1.5 rounded-lg hover:bg-[#f0e0d0] text-[#6B3E26] hover:text-[#c0607a] transition disabled:opacity-50"
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
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B3E26] hover:text-red-600 transition"
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
                          <p className="font-bold text-[#c0607a] text-sm">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {confirming && (
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#e8c4a0]">
                          <span className="text-[12px] text-[#6B3E26]">
                            ¿Quitar este producto de la orden?
                          </span>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setConfirmRemoveId(null)}
                              className="px-2.5 py-1 rounded-lg border border-[#e8c4a0] text-[#6B3E26] text-[11px] hover:bg-white transition"
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
                  <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
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
              <div className="flex flex-col gap-1 pt-1 border-t border-[#f0e0d0]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B3E26]">Subtotal</span>
                  <span className="text-[#3d1a24]">
                    ${orden.subtotal.toFixed(2)}
                  </span>
                </div>
                {orden.descuentoTotal > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-green-600">Descuento</span>
                    <span className="text-green-600">
                      −${orden.descuentoTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[#AA6A42]">Total</span>
                  <span className="font-bold text-[#c0607a] text-lg">
                    ${orden.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Pagos parciales */}
              <OrdenPagosSection
                ordenId={orden.id}
                ordenTotal={orden.total}
                status={orden.status}
              />

              {error && (
                <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Acciones de pipeline */}
              {orden.status !== "entregado" && orden.status !== "cancelado" && (
                <div className="flex gap-2">
                  {nextStatus && (
                    <button
                      onClick={handleAdvance}
                      disabled={updating}
                      className="flex-1 py-2 rounded-xl bg-[#c0607a] text-white text-[13px] font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8c4a0] text-[#AA6A42] text-[12px] font-semibold hover:bg-[#FFF7F0] disabled:opacity-50 transition"
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8c4a0] bg-[#FFF7F0] text-[#AA6A42] text-[12px] font-semibold hover:bg-[#f0e0d0] disabled:opacity-50 transition"
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
    <ProductoConfiguradorModal
      producto={editingOrigen === "producto-configurador" ? editProducto : null}
      onClose={closeEditModal}
      editItem={editingOrigen === "producto-configurador" && editingOrdenItem ? toCartItemShape(editingOrdenItem) : null}
      onSave={handleSaveItem}
    />
    </>
  );
}
