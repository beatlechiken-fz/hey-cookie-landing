"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCartStore } from "@/modules/admin/store/presentation/hooks/useCartStore";
import type { CartItem } from "@/modules/admin/store/presentation/hooks/useCartStore";
import type { OrdenCuponAplicado } from "@/modules/admin/store/domain/entities/Orden.entity";
import { buildOrdenClienteHtml } from "@/core/helpers/generarPDF";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface DireccionItem {
  id: string;
  alias: string;
  calle: string;
  colonia: string | null;
  ciudad: string | null;
  cp: string | null;
  referencias: string | null;
}

/* ── pequeños iconos inline ─────────────────────────────────── */
const BagIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const TagIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

const COSTO_ENVIO = 30;

/* ── helpers de descuento ──────────────────────────────────── */
function cuponMonto(c: OrdenCuponAplicado, base: number): number {
  return c.tipoDescuento === "porcentaje"
    ? base * (c.valor / 100)
    : Math.min(c.valor, base);
}

/* ─────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
────────────────────────────────────────────────────────────── */
export function CartDrawerPublic({ open, onClose }: Props) {
  const { data: session } = useSession();
  const isUser = session?.user?.role === "user";
  const router = useRouter();
  const locale = useLocale();

  const items           = useCartStore((s) => s.items);
  const cupones         = useCartStore((s) => s.cupones);
  const removeItem      = useCartStore((s) => s.removeItem);
  const updateCantidad  = useCartStore((s) => s.updateCantidad);
  const clearCart       = useCartStore((s) => s.clear);
  const addCupon        = useCartStore((s) => s.addCupon);
  const removeCupon     = useCartStore((s) => s.removeCupon);
  const removeItemCupon = useCartStore((s) => s.removeItemCupon);
  const subtotal        = useCartStore((s) => s.subtotal());
  const descuentoTotal  = useCartStore((s) => s.descuentoTotal());
  const total           = useCartStore((s) => s.total());

  // Global coupon input
  const [codigoGlobal, setCodigoGlobal]       = useState("");
  const [globalError, setGlobalError]           = useState<string | null>(null);
  const [globalOk, setGlobalOk]                 = useState<string | null>(null);
  const [validandoGlobal, setValidandoGlobal]   = useState(false);

  // Delivery date & address
  const [fechaEntrega, setFechaEntrega]         = useState("");
  const [direcciones, setDirecciones]           = useState<DireccionItem[]>([]);
  const [selectedDirId, setSelectedDirId]       = useState<string>(""); // "" = none, "new" = form
  const [showAddressForm, setShowAddressForm]   = useState(false);
  const [addAlias, setAddAlias]                 = useState("");
  const [addCalle, setAddCalle]                 = useState("");
  const [addColonia, setAddColonia]             = useState("");
  const [addCiudad, setAddCiudad]               = useState("");
  const [addCp, setAddCp]                       = useState("");
  const [addRefs, setAddRefs]                   = useState("");
  const [savingAddr, setSavingAddr]             = useState(false);
  const [addrError, setAddrError]               = useState<string | null>(null);

  // Order state
  const [generando, setGenerando]   = useState(false);
  const [ordenNum, setOrdenNum]     = useState<number | null>(null);
  const [ordenError, setOrdenError] = useState<string | null>(null);
  const [ordenSnapshot, setOrdenSnapshot] = useState<{
    items: CartItem[];
    subtotal: number;
    descuentoTotal: number;
    total: number;
    fechaEntrega: string | null;
    direccionEntrega: string | null;
  } | null>(null);

  // Cargar direcciones del cliente al abrir el carrito
  useEffect(() => {
    if (!open || !isUser) return;
    fetch("/api/user/direcciones")
      .then((r) => r.json())
      .then((d) => {
        const dirs: DireccionItem[] = d.direcciones ?? [];
        setDirecciones(dirs);
        if (dirs.length > 0 && !selectedDirId) setSelectedDirId(dirs[0].id);
      })
      .catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isUser]);

  // Escape key + body scroll
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── Aplicar cupón global ──────────────────────────────── */
  async function aplicarCuponGlobal() {
    if (!codigoGlobal.trim()) return;
    setGlobalError(null);
    setGlobalOk(null);
    setValidandoGlobal(true);
    try {
      const res = await fetch("/api/public/cupones/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoGlobal.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error ?? "Cupón inválido");
      } else {
        const cupon: OrdenCuponAplicado = {
          cuponId: data.cupon.id,
          codigo: data.cupon.codigo,
          tipoDescuento: data.cupon.tipoDescuento,
          valor: data.cupon.valor,
          montoDescontado: data.montoDescontado,
        };
        addCupon(cupon);
        setGlobalOk(`Cupón ${data.cupon.codigo} aplicado`);
        setCodigoGlobal("");
      }
    } catch {
      setGlobalError("Error al validar el cupón");
    } finally {
      setValidandoGlobal(false);
    }
  }

  /* ── Guardar nueva dirección ───────────────────────────── */
  async function guardarDireccion() {
    if (!addCalle.trim()) { setAddrError("La calle es requerida"); return; }
    setSavingAddr(true);
    setAddrError(null);
    try {
      const res = await fetch("/api/user/direcciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: addAlias, calle: addCalle, colonia: addColonia, ciudad: addCiudad, cp: addCp, referencias: addRefs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setDirecciones((prev) => [...prev, data]);
      setSelectedDirId(data.id);
      setShowAddressForm(false);
      setAddAlias(""); setAddCalle(""); setAddColonia(""); setAddCiudad(""); setAddCp(""); setAddRefs("");
    } catch (e: any) {
      setAddrError(e.message);
    } finally {
      setSavingAddr(false);
    }
  }

  /* ── Dirección seleccionada como texto ─────────────────── */
  function getDireccionTexto(): string | null {
    if (!selectedDirId || selectedDirId === "new") return null;
    const d = direcciones.find((x) => x.id === selectedDirId);
    if (!d) return null;
    return [d.calle, d.colonia, d.ciudad].filter(Boolean).join(", ");
  }

  /* ── Generar orden ─────────────────────────────────────── */
  async function generarOrden() {
    if (!isUser || items.length === 0) return;
    setGenerando(true);
    setOrdenError(null);
    const direccionEntrega = getDireccionTexto();
    try {
      const res = await fetch("/api/user/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items, cupones, subtotal, descuentoTotal, total: total + COSTO_ENVIO,
          fechaEntrega: fechaEntrega || null,
          direccionEntrega,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar la orden");
      setOrdenSnapshot({
        items: [...items], subtotal, descuentoTotal, total: total + COSTO_ENVIO,
        fechaEntrega: fechaEntrega || null,
        direccionEntrega,
      });
      setOrdenNum(data.numero);
      clearCart();
    } catch (e: any) {
      setOrdenError(e.message);
    } finally {
      setGenerando(false);
    }
  }

  function downloadPDF() {
    if (!ordenSnapshot || ordenNum === null) return;
    const html = buildOrdenClienteHtml({
      tipo: "orden",
      numero: ordenNum,
      clienteNombre: session?.user?.name ?? "Cliente",
      clienteEmail: session?.user?.email,
      fechaCreacion: new Date().toISOString(),
      fechaEntrega: ordenSnapshot.fechaEntrega,
      direccionEntrega: ordenSnapshot.direccionEntrega,
      items: ordenSnapshot.items.map((i) => ({
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        subtotal: i.precioUnitario * i.cantidad,
      })),
      subtotal: ordenSnapshot.subtotal,
      descuentoTotal: ordenSnapshot.descuentoTotal,
      total: ordenSnapshot.total,
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    setTimeout(() => { win?.print(); URL.revokeObjectURL(url); }, 600);
  }

  function goToLogin() {
    onClose();
    router.push("/user/login?from=cart");
  }
  function goToRegister() {
    onClose();
    router.push("/user/signin?from=cart");
  }

  /* ── Per-item discount helper ──────────────────────────── */
  function itemDescuentoCalc(precioUnitario: number, cantidad: number, cuponsItem: OrdenCuponAplicado[]) {
    const base = precioUnitario * cantidad;
    return (cuponsItem ?? []).reduce((s, c) => s + cuponMonto(c, base), 0);
  }

  /* ── Global discounts over subtotal after item discounts ── */
  const totalItemDisc = items.reduce((s, i) =>
    s + itemDescuentoCalc(i.precioUnitario, i.cantidad, i.cuponesItem), 0);
  const baseGlobal = Math.max(0, subtotal - totalItemDisc);
  const globalDisc = cupones.reduce((s, c) => s + cuponMonto(c, baseGlobal), 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[rgba(58,31,20,0.35)] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[101] h-full w-full max-w-sm flex flex-col bg-[#FFFDF8] border-l border-[#f0e0d0] shadow-2xl"
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e0d0] shrink-0">
              <div className="flex items-center gap-2">
                <BagIcon className="w-5 h-5 text-[#AA6A42]" />
                <h2 className="font-bold text-[#3A1F14] text-base font-body">Mi carrito</h2>
                {items.length > 0 && (
                  <span className="text-xs text-[#AA6A42]/60">({items.length})</span>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0e0d0] text-[#AA6A42] transition-colors cursor-pointer" aria-label="Cerrar">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* ── Confirmation state ──────────────────────── */}
            {ordenNum !== null ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#27ae60]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[#3A1F14] text-lg">¡Orden generada!</p>
                  <p className="text-[#AA6A42]/70 text-sm mt-1">Tu número de orden es</p>
                  <p className="text-3xl font-bold text-[#AA6A42] mt-1">#{ordenNum}</p>
                </div>
                <p className="text-xs text-[#AA6A42]/60 max-w-[260px]">
                  Hemos registrado tu pedido. El equipo de Hey Cookie se pondrá en contacto contigo para confirmar los detalles.
                </p>
                <button
                  onClick={downloadPDF}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[#AA6A42] hover:bg-[#8a5535] text-white font-bold text-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar PDF
                </button>
                <button
                  onClick={() => { setOrdenNum(null); onClose(); }}
                  className="px-6 py-2.5 rounded-xl border border-[#f0e0d0] text-[#AA6A42] font-bold text-sm transition-colors cursor-pointer hover:bg-[#fdf6f0]"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* ── Items list ──────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
                      <BagIcon className="w-14 h-14 text-[#e8c4a0]" />
                      <p className="text-[#AA6A42]/60 text-sm">Tu carrito está vacío</p>
                      <p className="text-[#AA6A42]/40 text-xs">Agrega galletas para comenzar</p>
                    </div>
                  ) : (
                    items.map((item) => {
                      const itemBase = item.precioUnitario * item.cantidad;
                      const itemDisc = itemDescuentoCalc(item.precioUnitario, item.cantidad, item.cuponesItem);
                      return (
                        <div key={item.id} className="bg-white rounded-xl border border-[#f0e0d0] shadow-[0_1px_4px_rgba(170,106,66,0.06)] overflow-hidden">
                          {/* Item main row */}
                          <div className="flex gap-3 p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#3A1F14] leading-snug line-clamp-2">{item.nombre}</p>
                              <p className="text-xs text-[#AA6A42] mt-0.5">${item.precioUnitario.toFixed(0)} / pz</p>
                              {/* Qty stepper */}
                              <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => updateCantidad(item.id, item.cantidad - 1)} className="w-6 h-6 rounded-md border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold text-sm cursor-pointer hover:bg-[#fde8d0] transition-colors flex items-center justify-center">−</button>
                                <span className="text-sm font-bold text-[#3A1F14] w-5 text-center">{item.cantidad}</span>
                                <button onClick={() => updateCantidad(item.id, item.cantidad + 1)} className="w-6 h-6 rounded-md border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold text-sm cursor-pointer hover:bg-[#fde8d0] transition-colors flex items-center justify-center">+</button>
                                <div className="ml-auto text-right">
                                  {itemDisc > 0 && (
                                    <p className="text-[10px] text-[#AA6A42]/50 line-through">${itemBase.toFixed(0)}</p>
                                  )}
                                  <p className="text-sm font-bold text-[#3A1F14]">${(itemBase - itemDisc).toFixed(0)}</p>
                                </div>
                              </div>
                            </div>
                            {/* Remove item */}
                            <button onClick={() => removeItem(item.id)} className="self-start p-1 rounded-lg text-[#AA6A42]/30 hover:text-[#c0607a] hover:bg-[#fdf6f0] transition-colors cursor-pointer" aria-label="Eliminar">
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Per-item coupons */}
                          {(item.cuponesItem ?? []).length > 0 && (
                            <div className="border-t border-[#f0e0d0] px-3 py-2 flex flex-col gap-1 bg-[#f9fff5]">
                              {item.cuponesItem.map((c) => (
                                <div key={c.cuponId} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <TagIcon className="w-3 h-3 text-[#27ae60] shrink-0" />
                                    <span className="text-[11px] font-semibold text-[#27ae60]">{c.codigo}</span>
                                    <span className="text-[11px] text-[#27ae60]/70">
                                      −${cuponMonto(c, item.precioUnitario * item.cantidad).toFixed(0)}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => removeItemCupon(item.id, c.cuponId)}
                                    className="p-0.5 rounded text-[#27ae60]/50 hover:text-[#c0607a] transition-colors cursor-pointer"
                                    aria-label="Quitar cupón"
                                  >
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ── Footer ─────────────────────────────── */}
                {items.length > 0 && (
                  <div className="shrink-0 border-t border-[#f0e0d0] px-5 py-4 flex flex-col gap-4 bg-[#FFFDF8]">

                    {/* Global coupon input */}
                    <div>
                      <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider mb-2">
                        Código promocional (todo el carrito)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej. PROMO15"
                          value={codigoGlobal}
                          onChange={(e) => {
                            setCodigoGlobal(e.target.value.toUpperCase());
                            setGlobalError(null);
                            setGlobalOk(null);
                          }}
                          onKeyDown={(e) => e.key === "Enter" && aplicarCuponGlobal()}
                          className="flex-1 border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                        />
                        <button
                          onClick={aplicarCuponGlobal}
                          disabled={validandoGlobal || !codigoGlobal.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[#FFF0E6] border border-[#e8c4a0] text-[#AA6A42] text-sm font-semibold cursor-pointer hover:bg-[#fde8d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {validandoGlobal ? "…" : "Aplicar"}
                        </button>
                      </div>
                      {globalError && (
                        <p className="mt-1 text-[11px] text-[#c0392b] flex items-center gap-1"><span>✕</span>{globalError}</p>
                      )}
                      {globalOk && (
                        <p className="mt-1 text-[11px] text-[#27ae60] font-semibold flex items-center gap-1"><span>✓</span>{globalOk}</p>
                      )}

                      {/* Applied global coupons */}
                      {cupones.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          {cupones.map((c) => (
                            <div key={c.cuponId} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <TagIcon className="w-3 h-3 text-[#27ae60]" />
                                <span className="text-[11px] font-semibold text-[#27ae60]">{c.codigo}</span>
                                <span className="text-[11px] text-[#27ae60]/70">−${cuponMonto(c, baseGlobal).toFixed(0)}</span>
                              </div>
                              <button onClick={() => removeCupon(c.cuponId)} className="p-0.5 rounded text-[#27ae60]/50 hover:text-[#c0607a] transition-colors cursor-pointer">
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fecha de entrega */}
                    {isUser && (
                      <div>
                        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider mb-1.5">
                          Fecha de entrega (opcional)
                        </p>
                        <input
                          type="date"
                          value={fechaEntrega}
                          onChange={(e) => setFechaEntrega(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                        />
                      </div>
                    )}

                    {/* Domicilio de entrega */}
                    {isUser && (
                      <div>
                        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider mb-1.5">
                          Domicilio de entrega (opcional)
                        </p>

                        <select
                          value={selectedDirId}
                          onChange={(e) => {
                            setSelectedDirId(e.target.value);
                            setShowAddressForm(e.target.value === "new");
                          }}
                          className="w-full border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                        >
                          <option value="">— Sin domicilio —</option>
                          {direcciones.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.alias} — {d.calle}{d.colonia ? `, ${d.colonia}` : ""}
                            </option>
                          ))}
                          <option value="new">+ Agregar nueva dirección</option>
                        </select>

                        {showAddressForm && (
                          <div className="mt-2 flex flex-col gap-1.5 bg-[#fdf9f5] border border-[#f0e0d0] rounded-xl p-3">
                            <input
                              type="text"
                              placeholder='Alias (ej. "Casa")'
                              value={addAlias}
                              onChange={(e) => setAddAlias(e.target.value)}
                              className="border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                            />
                            <input
                              type="text"
                              placeholder="Calle y número *"
                              value={addCalle}
                              onChange={(e) => setAddCalle(e.target.value)}
                              className="border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                            />
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Colonia"
                                value={addColonia}
                                onChange={(e) => setAddColonia(e.target.value)}
                                className="flex-1 border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                              />
                              <input
                                type="text"
                                placeholder="CP"
                                value={addCp}
                                onChange={(e) => setAddCp(e.target.value)}
                                className="w-20 border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Ciudad"
                              value={addCiudad}
                              onChange={(e) => setAddCiudad(e.target.value)}
                              className="border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                            />
                            <input
                              type="text"
                              placeholder="Referencias (entre qué calles, color de casa…)"
                              value={addRefs}
                              onChange={(e) => setAddRefs(e.target.value)}
                              className="border border-[#e8c4a0] rounded-lg px-3 py-1.5 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                            />
                            {addrError && (
                              <p className="text-[11px] text-[#c0392b]">✕ {addrError}</p>
                            )}
                            <div className="flex gap-2 mt-0.5">
                              <button
                                type="button"
                                onClick={guardarDireccion}
                                disabled={savingAddr}
                                className="flex-1 py-1.5 rounded-lg bg-[#AA6A42] hover:bg-[#8a5535] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 font-body"
                              >
                                {savingAddr ? "Guardando…" : "Guardar dirección"}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowAddressForm(false); setSelectedDirId(direcciones[0]?.id ?? ""); }}
                                className="px-3 py-1.5 rounded-lg border border-[#e8c4a0] text-[#AA6A42] text-xs font-semibold cursor-pointer hover:bg-[#fdf6f0] transition-colors font-body"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Totals */}
                    <div className="flex flex-col gap-1.5 border-t border-[#f0e0d0] pt-3">
                      <div className="flex justify-between text-sm text-[#AA6A42]/70">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(0)}</span>
                      </div>
                      {totalItemDisc > 0 && (
                        <div className="flex justify-between text-sm text-[#27ae60]">
                          <span>Descuento productos</span>
                          <span>−${totalItemDisc.toFixed(0)}</span>
                        </div>
                      )}
                      {globalDisc > 0 && (
                        <div className="flex justify-between text-sm text-[#27ae60]">
                          <span>Descuento cupón</span>
                          <span>−${globalDisc.toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-[#AA6A42]/70">
                        <span>Envío</span>
                        <span>${COSTO_ENVIO}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-[#3A1F14] border-t border-[#f0e0d0] pt-2 mt-1">
                        <span>Total</span>
                        <span>${(total + COSTO_ENVIO).toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Auth gate / Generar orden */}
                    {isUser ? (
                      <>
                        {ordenError && (
                          <p className="text-xs text-[#c0392b] bg-red-50 border border-red-200 rounded-lg px-3 py-2">{ordenError}</p>
                        )}
                        <button
                          onClick={generarOrden}
                          disabled={generando}
                          className="w-full py-3 rounded-xl bg-[#AA6A42] hover:bg-[#8a5535] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
                        >
                          {generando ? (
                            <span className="animate-pulse">Generando orden…</span>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                              </svg>
                              Generar orden
                            </>
                          )}
                        </button>
                        <button onClick={clearCart} className="w-full py-1.5 text-xs text-[#AA6A42]/50 hover:text-[#AA6A42] transition-colors cursor-pointer font-body">
                          Vaciar carrito
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3 bg-[#FFF7F0] border border-[#f0e0d0] rounded-xl p-4">
                        <p className="text-sm text-[#6B3E26] font-semibold text-center">
                          Inicia sesión para generar tu orden
                        </p>
                        <p className="text-xs text-[#AA6A42]/70 text-center -mt-1">
                          Tus productos están guardados, no los perderás.
                        </p>
                        <button
                          onClick={goToLogin}
                          className="w-full py-2.5 rounded-xl bg-[#AA6A42] hover:bg-[#8a5535] text-white font-bold text-sm transition-colors cursor-pointer font-body"
                        >
                          Iniciar sesión
                        </button>
                        <p className="text-xs text-center text-[#AA6A42]/60">
                          ¿No tienes cuenta?{" "}
                          <button onClick={goToRegister} className="text-[#DA6C94] font-semibold hover:underline cursor-pointer">
                            Crear una ahora
                          </button>
                        </p>
                        <button onClick={clearCart} className="text-xs text-[#AA6A42]/40 hover:text-[#AA6A42] transition-colors cursor-pointer font-body text-center">
                          Vaciar carrito
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
