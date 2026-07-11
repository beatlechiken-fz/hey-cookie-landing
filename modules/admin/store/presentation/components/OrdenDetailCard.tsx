"use client";
// src/modules/admin/clientes/presentation/components/OrdenDetailCard.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Orden,
  OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import { ORDEN_STATUS_LABELS } from "@/modules/admin/store/domain/entities/Orden.entity";
import { OrdenPipeline } from "./OrdenPipeline";
import { OrdenPagosSection } from "./OrdenPagosSection";
import {
  generarCotizacionPdf,
  generarComandaPdf,
} from "@/core/helpers/generarPDF";

interface Props {
  orden: Orden;
  onUpdateStatus: (id: string, status: OrdenStatus) => Promise<void>;
}

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

export function OrdenDetailCard({ orden, onUpdateStatus }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [editingFecha, setEditingFecha] = useState(false);
  const [fechaInput, setFechaInput] = useState(
    orden.fechaEntrega?.slice(0, 10) ?? "",
  );
  const [savingFecha, setSavingFecha] = useState(false);

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
    <div className="rounded-2xl border border-[#f5dce4] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#fdf6f0]/60 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <p className="font-bold text-[#3d1a24] text-sm">
              {orden.status === "cotizacion" ? "Cotización" : "Orden"} #
              {orden.numero}
            </p>
            <p className="text-[11px] text-[#b07a8a]">
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
              "w-4 h-4 text-[#b07a8a] transition-transform " +
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
              <div className="flex items-center justify-between rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-3 py-2.5">
                <div>
                  <p className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                    Fecha de entrega
                  </p>
                  {editingFecha ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="date"
                        value={fechaInput}
                        onChange={(e) => setFechaInput(e.target.value)}
                        className="text-sm border border-[#e8c4cd] rounded-lg px-2 py-1 text-[#3d1a24] focus:outline-none focus:border-[#c0607a]"
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
                        className="px-2 py-1 rounded-lg border border-[#e8c4cd] text-[#b07a8a] text-[11px] hover:bg-[#f5dce4] transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-[13px] font-semibold text-[#3d1a24] mt-0.5">
                      {orden.fechaEntrega ? (
                        formatDate(orden.fechaEntrega)
                      ) : (
                        <span className="text-[#c0a0a8] font-normal">
                          Sin fecha asignada
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {!editingFecha && (
                  <button
                    onClick={() => setEditingFecha(true)}
                    className="p-1.5 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-[#c0607a] transition"
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

              {/* Items */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                  Productos
                </p>
                {orden.items.map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="flex items-center justify-between rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-3 py-2"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-[#3d1a24]">
                        {item.nombre}
                      </p>
                      <p className="text-[11px] text-[#b07a8a]">
                        {item.cantidad} × ${item.precioUnitario.toFixed(2)}
                        {(item.configuracion as any)?.diametroCm
                          ? ` · ${(item.configuracion as any).diametroCm}cm`
                          : ""}
                      </p>
                    </div>
                    <p className="font-bold text-[#c0607a] text-sm">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Cupones */}
              {orden.cupones.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
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
              <div className="flex flex-col gap-1 pt-1 border-t border-[#f5dce4]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#b07a8a]">Subtotal</span>
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
                  <span className="font-bold text-[#7b2d42]">Total</span>
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8c4cd] text-[#7b2d42] text-[12px] font-semibold hover:bg-[#fdf6f0] disabled:opacity-50 transition"
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8c4cd] bg-[#fdf6f0] text-[#7b2d42] text-[12px] font-semibold hover:bg-[#f5dce4] disabled:opacity-50 transition"
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
  );
}
