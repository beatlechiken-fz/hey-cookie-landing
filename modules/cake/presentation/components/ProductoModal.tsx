"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useProductoConfigurador } from "@/modules/admin/store/presentation/hooks/useProductoConfigurador";
import { useCartStore } from "@/modules/admin/store/presentation/hooks/useCartStore";
import { personasDesdeDiametro } from "@/modules/admin/store/domain/entities/PastelMedida.entity";
import { NINGUNO } from "@/modules/admin/store/presentation/components/configurador/SelectField";
import { DiametroPersonasSelector } from "@/modules/admin/store/presentation/components/configurador/DiametroPersonasSelector";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";
import type { OrdenCuponAplicado } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { Cupon } from "@/modules/admin/store/domain/entities/Cupon.entity";
import { calcularDescuentoCupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

interface Props {
  producto: Producto;
  onClose: () => void;
}

interface CuponAplicado {
  cupon: Cupon;
  monto: number;
}

// ── Pequeños componentes de UI ────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider mb-1.5">
    {children}
  </p>
);

const NativeSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; sublabel?: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-xl border border-[#e8c4a0] bg-[#FFFDF8] text-sm text-[#3A1F14] outline-none focus:border-[#AA6A42] transition-colors cursor-pointer"
  >
    <option value={NINGUNO}>— Ninguno —</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}{o.sublabel ? ` (${o.sublabel})` : ""}
      </option>
    ))}
  </select>
);

const SectionDivider = () => <hr className="border-[#f0e0d0]" />;

// ── Visibilidad de opciones según tipo de producto ────────────────────────────
// Los campos ocultos siguen activos en opcionesDefault y afectan el precio.

interface Visibilidad {
  cobertura: boolean;
  saborCobertura: boolean;
  relleno: boolean;
  saborRelleno: boolean;
  licor: boolean;
  jarabe: boolean;
  saborJarabe: boolean;
  toppings: boolean;
}

const TODO_VISIBLE: Visibilidad = {
  cobertura: true, saborCobertura: true, relleno: true,
  saborRelleno: true, licor: true, jarabe: true, saborJarabe: true, toppings: true,
};

function getVisibilidad(nombre: string): Visibilidad {
  const n = nombre.toLowerCase();

  // Gelatinas y Jelly Pops → tamaño + cobertura + jarabe + toppings
  if (/gelatin|jelly/i.test(n)) {
    return { ...TODO_VISIBLE, saborCobertura: false, relleno: false, saborRelleno: false, licor: false, saborJarabe: false };
  }

  // Flan, Carlotta, Panna Cotta, Crème Brûlée, Mini Pavlovas → solo tamaño + toppings
  if (/flan|carlott|panna|cr[eè]me|pavlov/i.test(n)) {
    return { ...TODO_VISIBLE, cobertura: false, saborCobertura: false, relleno: false, saborRelleno: false, licor: false, jarabe: false, saborJarabe: false };
  }

  // Cheesecake → solo tamaño + toppings (cobertura oculta pero calculada)
  if (/cheesecake/i.test(n)) {
    return { ...TODO_VISIBLE, cobertura: false, saborCobertura: false, relleno: false, saborRelleno: false, licor: false, jarabe: false, saborJarabe: false };
  }

  // Tarta Sablé, Muffin → tamaño + cobertura + toppings
  if (/tarta|muffin/i.test(n)) {
    return { ...TODO_VISIBLE, saborCobertura: false, relleno: false, saborRelleno: false, licor: false, jarabe: false, saborJarabe: false };
  }

  // Panque → tamaño + cobertura + toppings + jarabe (con humedad)
  if (/panque/i.test(n)) {
    return { ...TODO_VISIBLE, saborCobertura: false, relleno: false, saborRelleno: false, licor: false, saborJarabe: false };
  }

  // Default: todo visible (pasteles completos)
  return TODO_VISIBLE;
}

// ── Modal principal ───────────────────────────────────────────────────────────

export default function ProductoModal({ producto, onClose }: Props) {
  const { data: session } = useSession();
  const isUser = session?.user?.role === "user";

  const {
    catalogo, loading, error,
    opciones, diametroCm, tamanoFijoId, cantidad,
    setDiametroCm, setTamanoFijoId, setCantidad,
    update, reset, desglose,
  } = useProductoConfigurador(producto, "/api/public/pastel-config");

  const addItem = useCartStore((s) => s.addItem);

  // Cupón por item
  const [codigoCupon, setCodigoCupon]     = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(null);
  const [cuponError, setCuponError]       = useState<string | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  const [justAdded, setJustAdded] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { reset(); onClose(); } };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, reset]);

  // ── Precio final ────────────────────────────────────────────────────────────
  const precioBase = desglose?.precioSugerido ?? producto.precioEstablecido ?? 0;
  const subtotal = precioBase * cantidad;
  const descuento = cuponAplicado ? calcularDescuentoCupon(cuponAplicado.cupon, subtotal) : 0;
  const total = Math.max(0, subtotal - descuento);

  // ── Tamaño activo ───────────────────────────────────────────────────────────
  const tamanoActivo = producto.tamanosFijos.find((t) => t.id === tamanoFijoId);

  // ── Nombre del item para el carrito ────────────────────────────────────────
  function buildNombreItem(): string {
    if (producto.permiteMedidaPersonalizada) {
      const personas = personasDesdeDiametro(diametroCm, producto.medidaBaseCm ?? 24);
      return `${producto.nombre} (${personas} personas)`;
    }
    if (tamanoActivo) return `${producto.nombre} (${tamanoActivo.nombre})`;
    return producto.nombre;
  }

  // ── Aplicar cupón ──────────────────────────────────────────────────────────
  async function aplicarCupon() {
    if (!codigoCupon.trim()) return;
    setCuponError(null);
    setValidandoCupon(true);
    try {
      const res = await fetch("/api/public/cupones/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoCupon.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCuponError(data.error ?? "Cupón inválido");
        setCuponAplicado(null);
      } else {
        setCuponAplicado({ cupon: data.cupon, monto: data.montoDescontado });
        setCuponError(null);
      }
    } catch {
      setCuponError("Error al validar el cupón");
    } finally {
      setValidandoCupon(false);
    }
  }

  // ── Agregar al carrito ─────────────────────────────────────────────────────
  function handleAdd() {
    if (!desglose) return;

    const cuponesItem: OrdenCuponAplicado[] = cuponAplicado
      ? [{
          cuponId: cuponAplicado.cupon.id,
          codigo: cuponAplicado.cupon.codigo,
          tipoDescuento: cuponAplicado.cupon.tipoDescuento,
          valor: cuponAplicado.cupon.valor,
          montoDescontado: descuento,
        }]
      : [];

    addItem({
      nombre: buildNombreItem(),
      configuracion: {
        productoId: producto.id,
        tipo: "pastel",
        opciones: { ...opciones },
        diametroCm: producto.permiteMedidaPersonalizada ? diametroCm : null,
        tamanoFijoId: tamanoActivo?.id ?? null,
      },
      cantidad,
      costoUnitario: desglose.costoProduccionTotal,
      precioUnitario: precioBase,
      cuponesItem,
      desgloseCostos: {
        costoInsumos: desglose.costoInsumos,
        costoProduccionTotal: desglose.costoProduccionTotal,
        precioSugerido: desglose.precioSugerido,
      },
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      reset();
      onClose();
    }, 900);
  }

  // Visibilidad de cada campo según tipo de producto
  const vis = getVisibilidad(producto.nombre);

  return (
    /* Overlay — scrollable cuando el contenido es alto */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(30,10,5,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) { reset(); onClose(); } }}
    >
      <div className="flex min-h-full items-center justify-center p-4 md:p-6">
        <div
          className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e0d0] bg-[#FFF7F0] shrink-0">
            <div>
              <h2 className="font-bold text-[#3A1F14] text-lg font-subtitle">
                {producto.nombre}
              </h2>
              {producto.descripcion && (
                <p className="text-xs text-[#AA6A42]/70 mt-0.5 line-clamp-1">
                  {producto.descripcion}
                </p>
              )}
            </div>
            <button
              onClick={() => { reset(); onClose(); }}
              className="p-1.5 rounded-lg hover:bg-[#f0e0d0] text-[#AA6A42] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "70vh" }}>
            {loading && (
              <p className="text-center text-[#AA6A42]/60 text-sm py-8 animate-pulse">
                Cargando opciones…
              </p>
            )}
            {error && (
              <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {!loading && !error && catalogo && (
              <>
                {/* ── Tamaño / Número de personas ── */}
                {producto.permiteMedidaPersonalizada && producto.medidaBaseCm && (
                  <DiametroPersonasSelector
                    label="Número de personas"
                    diametroCm={diametroCm}
                    medidaBaseCm={producto.medidaBaseCm}
                    onChange={setDiametroCm}
                  />
                )}

                {!producto.permiteMedidaPersonalizada && producto.tamanosFijos.length > 0 && (
                  <div>
                    <Label>Tamaño</Label>
                    <div className="flex flex-wrap gap-2">
                      {producto.tamanosFijos.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTamanoFijoId(t.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                            tamanoFijoId === t.id
                              ? "bg-[#AA6A42] text-white border-[#AA6A42]"
                              : "bg-white text-[#6B3E26] border-[#e8c4a0] hover:bg-[#FFF0E6]"
                          }`}
                        >
                          {t.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!producto.permiteMedidaPersonalizada && producto.tamanosFijos.length === 0 && (
                  <div className="rounded-xl bg-[#FFF7F0] border border-[#f0e0d0] px-4 py-3">
                    <p className="text-xs text-[#6B3E26]">
                      Tamaño único{producto.medidaBaseCm ? ` (${producto.medidaBaseCm}cm)` : ""}
                    </p>
                  </div>
                )}

                <SectionDivider />

                {/* ── Grid de opciones (controlado por vis) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cobertura */}
                  {vis.cobertura && (
                    <div>
                      <Label>Cobertura</Label>
                      <NativeSelect
                        value={opciones.coberturaId ?? NINGUNO}
                        onChange={(v) => update("coberturaId", v === NINGUNO ? null : v)}
                        options={catalogo.coberturas.map((c) => ({ value: c.id, label: c.nombre }))}
                      />
                    </div>
                  )}

                  {vis.saborCobertura && (
                    <div>
                      <Label>Sabor de cobertura</Label>
                      <NativeSelect
                        value={opciones.saborCoberturaId ?? NINGUNO}
                        onChange={(v) => update("saborCoberturaId", v === NINGUNO ? null : v)}
                        options={catalogo.saboresCobertura.map((s) => ({
                          value: s.id,
                          label: s.nombre,
                          sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                      />
                    </div>
                  )}

                  {/* Relleno */}
                  {vis.relleno && (
                    <div>
                      <Label>Relleno</Label>
                      <NativeSelect
                        value={opciones.rellenoId ?? NINGUNO}
                        onChange={(v) => update("rellenoId", v === NINGUNO ? null : v)}
                        options={catalogo.coberturas.map((c) => ({ value: c.id, label: c.nombre }))}
                      />
                    </div>
                  )}

                  {vis.saborRelleno && (
                    <div>
                      <Label>Sabor de relleno</Label>
                      <NativeSelect
                        value={opciones.saborRellenoId ?? NINGUNO}
                        onChange={(v) => update("saborRellenoId", v === NINGUNO ? null : v)}
                        options={catalogo.saboresCobertura.map((s) => ({
                          value: s.id,
                          label: s.nombre,
                          sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                      />
                    </div>
                  )}

                  {/* Licor */}
                  {vis.licor && (
                    <div>
                      <Label>Licor</Label>
                      <NativeSelect
                        value={opciones.licorId ?? NINGUNO}
                        onChange={(v) => update("licorId", v === NINGUNO ? null : v)}
                        options={catalogo.licores
                          .filter((l) => l.cantidad != null)
                          .map((l) => ({ value: l.ingredienteId, label: l.nombre, sublabel: `${l.cantidad}ml` }))}
                      />
                    </div>
                  )}

                  {/* Jarabe */}
                  {vis.jarabe && (
                    <div>
                      <Label>Jarabe</Label>
                      <NativeSelect
                        value={opciones.jarabeId ?? NINGUNO}
                        onChange={(v) => {
                          update("jarabeId", v === NINGUNO ? null : v);
                          if (v === NINGUNO) {
                            update("saborJarabeId", null);
                            update("humedadJarabe", null);
                          }
                        }}
                        options={catalogo.jarabes.map((j) => ({ value: j.id, label: j.nombre }))}
                      />
                    </div>
                  )}

                  {/* Sabor de jarabe — solo si jarabe visible + saborJarabe visible + seleccionado */}
                  {vis.jarabe && vis.saborJarabe && opciones.jarabeId && (
                    <div>
                      <Label>Sabor de jarabe</Label>
                      <NativeSelect
                        value={opciones.saborJarabeId ?? NINGUNO}
                        onChange={(v) => update("saborJarabeId", v === NINGUNO ? null : v)}
                        options={catalogo.saboresJarabe.map((s) => ({
                          value: s.id,
                          label: s.nombre,
                          sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                      />
                    </div>
                  )}

                  {/* Toggle humedad — siempre que jarabe sea visible y esté seleccionado */}
                  {vis.jarabe && opciones.jarabeId && (
                    <div className="sm:col-span-2">
                      <Label>Humedad del pastel</Label>
                      <div className="flex rounded-xl border border-[#e8c4a0] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => update("humedadJarabe", "semi_humedo")}
                          className={`flex-1 py-2 text-sm font-medium transition cursor-pointer ${
                            (opciones.humedadJarabe ?? "semi_humedo") === "semi_humedo"
                              ? "bg-[#AA6A42] text-white"
                              : "bg-white text-[#6B3E26] hover:bg-[#FFF0E6]"
                          }`}
                        >
                          Semi húmedo
                        </button>
                        <button
                          type="button"
                          onClick={() => update("humedadJarabe", "humedo")}
                          className={`flex-1 py-2 text-sm font-medium transition border-l border-[#e8c4a0] cursor-pointer ${
                            opciones.humedadJarabe === "humedo"
                              ? "bg-[#AA6A42] text-white"
                              : "bg-white text-[#6B3E26] hover:bg-[#FFF0E6]"
                          }`}
                        >
                          Húmedo{" "}
                          <span className="text-[11px] opacity-70">(×2.2)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mostrar divisor solo si hay al menos una opción visible */}
                {(vis.cobertura || vis.relleno || vis.licor || vis.jarabe) && <SectionDivider />}

                {/* ── Toppings ── */}
                {vis.toppings && (
                  <div>
                    <Label>Toppings</Label>
                    <div className="flex flex-wrap gap-2">
                      {catalogo.toppings
                        .filter((t) => t.cantidad != null)
                        .map((t) => {
                          const active = opciones.toppingIds.includes(t.ingredienteId);
                          return (
                            <button
                              key={t.ingredienteId}
                              type="button"
                              onClick={() => {
                                const next = active
                                  ? opciones.toppingIds.filter((id) => id !== t.ingredienteId)
                                  : [...opciones.toppingIds, t.ingredienteId];
                                update("toppingIds", next);
                              }}
                              className={`flex items-center gap-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                t.imagenUrl ? "pl-1.5 pr-3 py-1.5" : "px-3 py-1.5"
                              } ${
                                active
                                  ? "bg-[#DA6C94] text-white border-[#DA6C94]"
                                  : "bg-white text-[#6B3E26] border-[#e8c4a0] hover:bg-[#FFF0E6]"
                              }`}
                            >
                              {t.imagenUrl && (
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                  <Image
                                    src={t.imagenUrl}
                                    alt={t.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                  />
                                </div>
                              )}
                              <span>{t.nombre}</span>
                              <span className="opacity-60">{t.cantidad}{t.unidad}</span>
                            </button>
                          );
                        })}
                      {catalogo.toppings.filter((t) => t.cantidad != null).length === 0 && (
                        <p className="text-xs text-[#AA6A42]/50">Sin toppings disponibles</p>
                      )}
                    </div>
                  </div>
                )}

                <SectionDivider />

                {/* ── Cupón ── */}
                <div>
                  <Label>{isUser ? "Cupón de descuento" : "Código promocional"}</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. COOKIE10"
                      value={codigoCupon}
                      onChange={(e) => {
                        setCodigoCupon(e.target.value.toUpperCase());
                        setCuponAplicado(null);
                        setCuponError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && aplicarCupon()}
                      className="flex-1 border border-[#e8c4a0] rounded-xl px-3 py-2 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#AA6A42] transition-colors"
                    />
                    <button
                      onClick={aplicarCupon}
                      disabled={validandoCupon || !codigoCupon.trim()}
                      className="px-3 py-2 rounded-xl bg-[#FFF0E6] border border-[#e8c4a0] text-[#AA6A42] text-sm font-semibold cursor-pointer hover:bg-[#fde8d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {validandoCupon ? "…" : "Aplicar"}
                    </button>
                  </div>
                  {cuponError && (
                    <p className="mt-1.5 text-xs text-[#c0392b] flex items-center gap-1">✕ {cuponError}</p>
                  )}
                  {cuponAplicado && (
                    <p className="mt-1.5 text-xs text-[#27ae60] font-semibold flex items-center gap-1">
                      ✓ Descuento: −${descuento.toFixed(0)}
                    </p>
                  )}
                  {!isUser && (
                    <p className="mt-1 text-[10px] text-[#AA6A42]/50">
                      Inicia sesión para cupones personalizados
                    </p>
                  )}
                </div>

                {/* ── Cantidad + Total ── */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label>Cantidad</Label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="w-8 h-8 rounded-lg border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold cursor-pointer hover:bg-[#fde8d0] transition-colors flex items-center justify-center"
                      >−</button>
                      <span className="text-sm font-bold text-[#3A1F14] w-6 text-center">{cantidad}</span>
                      <button
                        onClick={() => setCantidad(cantidad + 1)}
                        className="w-8 h-8 rounded-lg border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold cursor-pointer hover:bg-[#fde8d0] transition-colors flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  <div className="text-right">
                    {desglose && (
                      <>
                        {cuponAplicado && (
                          <p className="text-xs text-[#AA6A42]/50 line-through">${subtotal.toFixed(0)}</p>
                        )}
                        <p className="text-lg font-bold text-[#3A1F14]">
                          ${total.toFixed(0)}
                        </p>
                        {cantidad > 1 && (
                          <p className="text-[10px] text-[#AA6A42]/60">${precioBase.toFixed(0)} c/u</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#f0e0d0] bg-[#FFFDF8] shrink-0">
            {desglose && !justAdded && (
              <div className="flex items-baseline justify-end gap-1.5 mb-3">
                {cuponAplicado && (
                  <span className="text-sm text-[#AA6A42]/50 line-through">${subtotal.toFixed(0)}</span>
                )}
                <span className="text-2xl font-bold text-[#3A1F14]">${total.toFixed(0)}</span>
                {cantidad > 1 && (
                  <span className="text-xs text-[#AA6A42]/60">${precioBase.toFixed(0)} c/u</span>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { reset(); onClose(); }}
                className="flex-1 py-2.5 rounded-xl border border-[#e8c4a0] text-[#AA6A42] text-sm font-semibold hover:bg-[#FFF0E6] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!desglose || loading || justAdded}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                  justAdded
                    ? "bg-[#6ab04c]"
                    : "bg-[#DA6C94] hover:bg-[#c0607a] disabled:opacity-50"
                }`}
              >
                {justAdded ? (
                  <>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Agregado
                  </>
                ) : (
                  <>
                    <Image
                      src="/icons/shopping-bag.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="shrink-0"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                    <span>Agregar al carrito</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
