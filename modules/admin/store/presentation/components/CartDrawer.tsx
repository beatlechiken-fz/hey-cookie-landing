"use client";
// src/modules/admin/store/presentation/components/CartDrawer.tsx

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import { useOrdenes, useValidarCupon } from "../hooks/useOrdenes";
import type {
  CreateOrdenDTO,
  OrdenItem,
} from "../../domain/entities/Orden.entity";
import type { ClienteResumen } from "../../domain/entities/Cliente.entity";
import { useRouter } from "@/i18n/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const cupones = useCartStore((s) => s.cupones);
  const clienteId = useCartStore((s) => s.clienteId);
  const clienteNombre = useCartStore((s) => s.clienteNombre);
  const setCliente = useCartStore((s) => s.setCliente);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateCantidad = useCartStore((s) => s.updateCantidad);
  const addCupon = useCartStore((s) => s.addCupon);
  const removeCupon = useCartStore((s) => s.removeCupon);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());
  const descuentoTotal = useCartStore((s) => s.descuentoTotal());
  const total = useCartStore((s) => s.total());

  const { createOrden, creating } = useOrdenes();
  const { validar, validating, error: cuponError } = useValidarCupon();
  const router = useRouter();

  const COSTO_ENVIO = 30;

  const [cuponInput, setCuponInput] = useState("");
  const [localCuponError, setLocalCuponError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fechaEntrega, setFechaEntrega] = useState<string>("");
  const [incluirEnvio, setIncluirEnvio] = useState(false);

  // Buscador de cliente
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteResults, setClienteResults] = useState<ClienteResumen[]>([]);
  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setCuponInput("");
      setLocalCuponError(null);
      setSuccessMsg(null);
      setClienteSearchOpen(false);
      setClienteSearch("");
      setFechaEntrega("");
      setIncluirEnvio(false);
    }
  }, [open]);

  // Buscar clientes con debounce simple
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

  async function handleAplicarCupon(e: React.FormEvent) {
    e.preventDefault();
    if (!cuponInput.trim()) return;
    setLocalCuponError(null);
    try {
      const { cupon, montoDescontado } = await validar(
        cuponInput.trim(),
        subtotal,
        clienteId,
      );
      addCupon({
        cuponId: cupon.id,
        codigo: cupon.codigo,
        tipoDescuento: cupon.tipoDescuento,
        valor: cupon.valor,
        montoDescontado,
      });
      setCuponInput("");
    } catch (e: any) {
      setLocalCuponError(e.message);
    }
  }

  function buildOrdenItems(): OrdenItem[] {
    return items.map((i) => ({
      tipo: "pastel_personalizado" as const,
      nombre: i.nombre,
      configuracion: i.configuracion,
      cantidad: i.cantidad,
      costoUnitario: i.costoUnitario,
      precioUnitario: i.precioUnitario,
      subtotal: i.precioUnitario * i.cantidad,
      desgloseCostos: i.desgloseCostos ?? null,
    }));
  }

  async function handleGenerar(status: "cotizacion" | "en_proceso") {
    if (items.length === 0) return;
    setLocalCuponError(null);
    try {
      const dto: CreateOrdenDTO = {
        clienteId,
        status,
        fechaEntrega: fechaEntrega || null,
        items: buildOrdenItems(),
        cupones: cupones.map((c) => ({
          cuponId: c.cuponId,
          codigo: c.codigo,
          tipoDescuento: c.tipoDescuento,
          valor: c.valor,
          montoDescontado: c.montoDescontado,
        })),
      };
      const orden = await createOrden(dto);
      // Genera PDF automáticamente al crear
      try {
        const { generarCotizacionPdf } =
          await import("@/core/helpers/generarPDF");
        await generarCotizacionPdf(orden, incluirEnvio ? COSTO_ENVIO : undefined);
      } catch (_) {
        /* PDF es best-effort, no bloquea el flujo */
      }
      setSuccessMsg(
        status === "cotizacion"
          ? `Cotización #${orden.numero} generada — descargando PDF…`
          : `Orden #${orden.numero} generada — descargando PDF…`,
      );
      clearCart();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (e: any) {
      setLocalCuponError(e.message);
    }
  }

  const editIcon = (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
          />

          <motion.div
            key="drawer"
            ref={ref}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 flex flex-col bg-white"
            style={{
              borderLeft: "1px solid #f5dce4",
              boxShadow: "-4px 0 32px rgba(123,45,66,0.10)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
              <div className="flex items-center gap-2.5">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#c0607a]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <h2 className="font-bold text-[#7b2d42] text-base">
                  Carrito de compras
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Selector de cliente */}
            <div className="px-6 py-4 border-b border-[#f5dce4] shrink-0 relative">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Cliente
              </label>
              {clienteId ? (
                <div className="mt-1.5 flex items-center justify-between rounded-lg bg-[#fdf6f0] border border-[#f5dce4] px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#c0607a] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {(clienteNombre ?? "?").slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-[13px] font-semibold text-[#3d1a24] truncate">
                      {clienteNombre}
                    </p>
                  </div>
                  <button
                    onClick={() => setCliente(null)}
                    className="p-1 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-red-500 transition shrink-0"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="mt-1.5">
                  <input
                    value={clienteSearch}
                    onChange={(e) => {
                      setClienteSearch(e.target.value);
                      setClienteSearchOpen(true);
                    }}
                    onFocus={() => setClienteSearchOpen(true)}
                    placeholder="Buscar cliente por nombre, teléfono o email…"
                    className="w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#c0a0a8]"
                  />
                  {clienteSearchOpen && (
                    <div className="absolute left-6 right-6 mt-1 rounded-xl border border-[#f5dce4] bg-white shadow-lg z-10 overflow-hidden max-h-52 overflow-y-auto">
                      {clienteLoading && (
                        <p className="px-3 py-2.5 text-[12px] text-[#c0a0a8]">
                          Buscando…
                        </p>
                      )}
                      {!clienteLoading && clienteResults.length === 0 && (
                        <p className="px-3 py-2.5 text-[12px] text-[#c0a0a8]">
                          {clienteSearch.trim()
                            ? "Sin resultados"
                            : "Escribe para buscar un cliente"}
                        </p>
                      )}
                      {!clienteLoading &&
                        clienteResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCliente({ id: c.id, nombre: c.nombre });
                              setClienteSearchOpen(false);
                              setClienteSearch("");
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-[#fdf6f0] transition border-b border-[#f9eef2] last:border-b-0"
                          >
                            <p className="text-[13px] font-semibold text-[#3d1a24]">
                              {c.nombre}
                            </p>
                            {(c.telefono || c.email) && (
                              <p className="text-[11px] text-[#b07a8a]">
                                {[c.telefono, c.email]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </button>
                        ))}
                      <button
                        type="button"
                        onClick={() => setClienteSearchOpen(false)}
                        className="w-full text-center px-3 py-2 text-[12px] text-[#b07a8a] hover:bg-[#fdf6f0] transition border-t border-[#f5dce4]"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-[#c0a0a8] mt-1">
                    Opcional. Permite usar cupones individuales del cliente.
                  </p>
                </div>
              )}

              {/* Fecha de entrega — siempre visible */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                  Fecha de entrega{" "}
                  <span className="text-[#c0a0a8] normal-case font-normal">
                    (opcional)
                  </span>
                </label>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-12 h-12 text-[#e8c4cd]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p className="text-[#c0a0a8] text-sm">
                    El carrito está vacío
                  </p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#f5dce4] p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#3d1a24] text-sm">
                              {item.nombre}
                            </p>
                            <p className="text-[11px] text-[#b07a8a]">
                              ${item.precioUnitario.toFixed(2)} c/u
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-[#c0a0a8] hover:text-red-500 transition shrink-0"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-4 h-4"
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
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-[#e8c4cd] overflow-hidden">
                            <button
                              onClick={() =>
                                updateCantidad(item.id, item.cantidad - 1)
                              }
                              disabled={item.cantidad <= 1}
                              className="w-7 h-7 flex items-center justify-center text-[#c0607a] hover:bg-[#fdf6f0] disabled:opacity-30 transition text-sm font-bold"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-[#3d1a24]">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                updateCantidad(item.id, item.cantidad + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center text-[#c0607a] hover:bg-[#fdf6f0] transition text-sm font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-[#c0607a] text-sm">
                            ${(item.precioUnitario * item.cantidad).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-[#f5dce4]" />

                  {/* Cupones aplicados */}
                  {cupones.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                        Cupones aplicados
                      </p>
                      {cupones.map((c) => (
                        <div
                          key={c.cuponId}
                          className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2"
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-green-700">
                              {c.codigo}
                            </p>
                            <p className="text-[11px] text-green-600">
                              {c.tipoDescuento === "porcentaje"
                                ? `${c.valor}% de descuento`
                                : `$${c.valor} de descuento`}
                              {" · "}−${c.montoDescontado.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeCupon(c.cuponId)}
                            className="p-1 rounded-lg hover:bg-green-100 text-green-600 transition"
                          >
                            {editIcon}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Aplicar cupón */}
                  <form
                    onSubmit={handleAplicarCupon}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Código de cupón
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={cuponInput}
                        onChange={(e) =>
                          setCuponInput(e.target.value.toUpperCase())
                        }
                        placeholder="Ej: VERANO2026"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition uppercase placeholder:normal-case placeholder:text-[#c0a0a8]"
                      />
                      <button
                        type="submit"
                        disabled={validating || !cuponInput.trim()}
                        className="px-4 py-2 rounded-lg bg-[#fdf6f0] border border-[#e8c4cd] text-[#7b2d42] text-sm font-semibold hover:bg-[#f5dce4] disabled:opacity-50 transition"
                      >
                        {validating ? "..." : "Aplicar"}
                      </button>
                    </div>
                    {localCuponError && (
                      <p className="text-[12px] text-red-600">
                        {localCuponError}
                      </p>
                    )}
                  </form>

                  <div className="h-px bg-[#f5dce4]" />

                  {/* Toggle envío */}
                  <div className="flex items-center justify-between rounded-xl border border-[#e8c4cd] bg-[#fdf6f0] px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#3d1a24]">
                        Envío a domicilio
                      </p>
                      <p className="text-[11px] text-[#b07a8a]">
                        +$30.00 si aplica
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncluirEnvio((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                        incluirEnvio ? "bg-[#c0607a]" : "bg-[#e8c4cd]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          incluirEnvio ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Totales */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#b07a8a]">Subtotal</span>
                      <span className="text-[#3d1a24] font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    {descuentoTotal > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">Descuento</span>
                        <span className="text-green-600 font-medium">
                          −${descuentoTotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {incluirEnvio && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#b07a8a]">Envío</span>
                        <span className="text-[#3d1a24] font-medium">
                          +${COSTO_ENVIO.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#f5dce4]">
                      <span className="text-[#7b2d42] font-bold">Total</span>
                      <span className="text-[#c0607a] font-bold text-xl">
                        ${(total + (incluirEnvio ? COSTO_ENVIO : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="flex flex-col gap-2 px-6 py-4 border-t border-[#f5dce4] bg-white shrink-0">
                {successMsg && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-center text-[13px] font-semibold text-green-700">
                    {successMsg}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleGenerar("cotizacion")}
                    disabled={creating}
                    className="flex-1 py-2.5 rounded-xl border border-[#c0607a] text-[#c0607a] text-sm font-bold hover:bg-[#fdf6f0] disabled:opacity-50 transition"
                  >
                    {creating ? "Generando…" : "Generar cotización"}
                  </button>
                  <button
                    onClick={() => handleGenerar("en_proceso")}
                    disabled={creating}
                    className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                  >
                    {creating ? "Generando…" : "Generar orden"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
