"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useProductoConfigurador } from "@/modules/admin/store/presentation/hooks/useProductoConfigurador";
import { useCartStore, type CartItem } from "@/modules/admin/store/presentation/hooks/useCartStore";
import { personasDesdeDiametro } from "@/modules/admin/store/domain/entities/PastelMedida.entity";
import { NINGUNO } from "@/modules/admin/store/presentation/components/configurador/SelectField";
import { DiametroPersonasSelectorPublic as DiametroPersonasSelector } from "./DiametroPersonasSelectorPublic";
import {
  getPrecioEstablecidoEfectivo,
  type Producto,
} from "@/modules/admin/store/domain/entities/Producto.entity";
import type { OrdenCuponAplicado } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { Cupon } from "@/modules/admin/store/domain/entities/Cupon.entity";
import { calcularDescuentoCupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

interface Props {
  producto: Producto;
  onClose: () => void;
  /** Item del carrito a editar — si viene, precarga la config y guarda in-place en vez de agregar uno nuevo. */
  editItem?: CartItem | null;
}

interface CuponAplicado {
  cupon: Cupon;
  monto: number;
}

// ── Pequeños componentes de UI ────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider mb-1.5">
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

interface CoberturaRow {
  id: string;
  saborId: string | null;
  /** Escala las cantidades/costo de ESTA cobertura o relleno en particular — 1 = normal. */
  factor?: number;
}

/** N coberturas/rellenos, cada una con su propio sabor opcional — todas suman al precio. */
function MultiCoberturaSelect({
  label,
  items,
  onChange,
  options,
  sabores,
  addLabel,
}: {
  label: string;
  items: CoberturaRow[];
  onChange: (items: CoberturaRow[]) => void;
  options: { value: string; label: string }[];
  sabores: { value: string; label: string; sublabel?: string }[];
  addLabel: string;
}) {
  const addRow = () => onChange([...items, { id: "", saborId: null }]);
  const removeRow = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateRow = (idx: number, patch: Partial<CoberturaRow>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div className="sm:col-span-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <NativeSelect
                value={item.id || NINGUNO}
                onChange={(v) => updateRow(idx, { id: v === NINGUNO ? "" : v, saborId: null })}
                options={options}
              />
              {item.id && sabores.length > 0 && (
                <NativeSelect
                  value={item.saborId ?? NINGUNO}
                  onChange={(v) => updateRow(idx, { saborId: v === NINGUNO ? null : v })}
                  options={sabores}
                />
              )}
              {item.id && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                    Factor
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={item.factor ?? 1}
                    onChange={(e) =>
                      updateRow(idx, {
                        factor: Math.max(0.1, Math.min(5, Number(e.target.value) || 1)),
                      })
                    }
                    className="w-20 px-2 py-1 rounded-lg border border-[#e8c4a0] bg-white text-[#3A1F14] text-[12px] font-semibold text-center focus:outline-none focus:border-[#AA6A42] focus:ring-1 focus:ring-[#AA6A42]/20 transition"
                  />
                  <span className="text-[11px] text-[#6B3E26]/80">
                    × cantidad{(item.factor ?? 1) !== 1 && ` (${((item.factor ?? 1) * 100).toFixed(0)}%)`}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-[#AA6A42] hover:bg-[#FFF0E6] transition cursor-pointer shrink-0"
              aria-label="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-[#AA6A42]/50">Ninguna</p>
        )}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-xs font-semibold text-[#A84D66] hover:text-[#8f3f54] transition cursor-pointer"
      >
        {addLabel}
      </button>
    </div>
  );
}

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

export default function ProductoModal({ producto, onClose, editItem }: Props) {
  const { data: session } = useSession();
  const isUser = session?.user?.role === "user";

  const {
    catalogo, loading, error,
    opciones, diametroCm, tamanoFijoId, cantidad,
    setOpciones, setDiametroCm, setTamanoFijoId, setCantidad,
    update, reset, desglose,
  } = useProductoConfigurador(producto, "/api/public/pastel-config");

  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);

  // En modo edición, sobreescribe los defaults del producto con la config guardada en el carrito.
  useEffect(() => {
    if (!editItem) return;
    // any: configuracion guardada es un objeto plano {productoId, opciones,
    // diametroCm, tamanoFijoId} sin tipo dedicado — se lee tal cual se guardó.
    const conf = editItem.configuracion as Record<string, any>;
    if (conf.opciones) setOpciones(conf.opciones);
    if (conf.diametroCm != null) setDiametroCm(conf.diametroCm);
    if (conf.tamanoFijoId !== undefined) setTamanoFijoId(conf.tamanoFijoId);
    setCantidad(editItem.cantidad);
  }, [editItem, setOpciones, setDiametroCm, setTamanoFijoId, setCantidad]);

  // Cupón por item
  const [codigoCupon, setCodigoCupon]     = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(null);
  const [cuponError, setCuponError]       = useState<string | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  const [justAdded, setJustAdded] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { reset(); onClose(); } };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, reset]);

  // ── Precio final ────────────────────────────────────────────────────────────
  const precioBase =
    desglose?.precioSugerido ??
    getPrecioEstablecidoEfectivo(producto, tamanoFijoId) ??
    0;
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
      : (editItem?.cuponesItem ?? []);

    // Descarta filas de cobertura/relleno que el usuario agregó pero dejó sin elegir.
    const opcionesLimpias = {
      ...opciones,
      coberturas: opciones.coberturas.filter((c) => c.coberturaId),
      rellenos: opciones.rellenos.filter((r) => r.rellenoId),
    };

    const payload = {
      nombre: buildNombreItem(),
      configuracion: {
        productoId: producto.id,
        tipo: "pastel",
        opciones: opcionesLimpias,
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
      origen: "producto-modal" as const,
      productoId: producto.id,
    };
    if (editItem) updateItem(editItem.id, payload);
    else addItem(payload);

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
          role="dialog"
          aria-modal="true"
          aria-labelledby="producto-modal-title"
          className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#f0e0d0] bg-[#FFF7F0] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {producto.imagenUrl && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#f0e0d0]">
                  <Image
                    src={producto.imagenUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 id="producto-modal-title" className="font-bold text-[#3A1F14] text-lg font-subtitle">
                  {editItem ? `Editar: ${producto.nombre}` : producto.nombre}
                </h2>
                {producto.descripcion && (
                  <p className="text-xs text-[#AA6A42]/70 mt-0.5 line-clamp-1">
                    {producto.descripcion}
                  </p>
                )}
              </div>
            </div>
            <button
              ref={closeBtnRef}
              onClick={() => { reset(); onClose(); }}
              className="p-3 -m-1.5 rounded-lg hover:bg-[#f0e0d0] text-[#AA6A42] transition-colors cursor-pointer shrink-0"
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
                  {/* Coberturas (varias, todas suman al precio) */}
                  {vis.cobertura && (
                    <MultiCoberturaSelect
                      label="Coberturas"
                      items={opciones.coberturas.map((c) => ({ id: c.coberturaId, saborId: c.saborCoberturaId, factor: c.factor ?? 1 }))}
                      onChange={(items) =>
                        update(
                          "coberturas",
                          items.map((it) => ({ coberturaId: it.id, saborCoberturaId: it.saborId, factor: it.factor ?? 1 })),
                        )
                      }
                      options={catalogo.coberturas.map((c) => ({ value: c.id, label: c.nombre }))}
                      sabores={
                        vis.saborCobertura
                          ? catalogo.saboresCobertura.map((s) => ({
                              value: s.id,
                              label: s.nombre,
                              sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                            }))
                          : []
                      }
                      addLabel="+ Agregar cobertura"
                    />
                  )}

                  {/* Rellenos (varios, todos suman al precio) */}
                  {vis.relleno && (
                    <MultiCoberturaSelect
                      label="Rellenos"
                      items={opciones.rellenos.map((r) => ({ id: r.rellenoId, saborId: r.saborRellenoId, factor: r.factor ?? 1 }))}
                      onChange={(items) =>
                        update(
                          "rellenos",
                          items.map((it) => ({ rellenoId: it.id, saborRellenoId: it.saborId, factor: it.factor ?? 1 })),
                        )
                      }
                      options={catalogo.coberturas.map((c) => ({ value: c.id, label: c.nombre }))}
                      sabores={
                        vis.saborRelleno
                          ? catalogo.saboresCobertura.map((s) => ({
                              value: s.id,
                              label: s.nombre,
                              sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                            }))
                          : []
                      }
                      addLabel="+ Agregar relleno"
                    />
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
                          className={`flex-1 py-2 min-h-11 text-sm font-medium transition cursor-pointer ${
                            (opciones.humedadJarabe ?? "semi_humedo") === "semi_humedo"
                              ? "bg-[#8A5535] text-white"
                              : "bg-white text-[#6B3E26] hover:bg-[#FFF0E6]"
                          }`}
                        >
                          Semi húmedo
                        </button>
                        <button
                          type="button"
                          onClick={() => update("humedadJarabe", "humedo")}
                          className={`flex-1 py-2 min-h-11 text-sm font-medium transition border-l border-[#e8c4a0] cursor-pointer ${
                            opciones.humedadJarabe === "humedo"
                              ? "bg-[#8A5535] text-white"
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

                {/* ── Extras opcionales (Toppings + Ornamentos), colapsado por defecto ── */}
                {(vis.toppings || catalogo.ornamentos.length > 0) && (() => {
                  const extrasCount =
                    opciones.toppings.length +
                    opciones.ornamentos.reduce((sum, o) => sum + o.cantidad, 0);
                  return (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowExtras((v) => !v)}
                        className="w-full flex items-center justify-between py-1 min-h-11 cursor-pointer"
                      >
                        <span className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                          Extras opcionales
                          {extrasCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#DA6C94] text-white text-[11px] font-bold normal-case tracking-normal">
                              {extrasCount}
                            </span>
                          )}
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          className={`w-4 h-4 text-[#AA6A42] transition-transform ${showExtras ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>

                      {showExtras && (
                        <div className="flex flex-col gap-4 mt-3">
                          {/* ── Toppings ── */}
                          {vis.toppings && (
                            <div>
                              <Label>Toppings</Label>
                              <div className="flex flex-wrap gap-2">
                                {catalogo.toppings
                                  .filter((t) => t.cantidad != null)
                                  .map((t) => {
                                    const sel = opciones.toppings.find((x) => x.ingredienteId === t.ingredienteId);
                                    const active = !!sel;
                                    return (
                                      <div
                                        key={t.ingredienteId}
                                        className={`flex items-center gap-1.5 rounded-xl text-xs font-semibold border transition ${
                                          t.imagenUrl ? "pl-1.5 pr-2 py-1.5" : "px-3 py-1.5"
                                        } ${
                                          active
                                            ? "bg-[#DA6C94] text-white border-[#DA6C94]"
                                            : "bg-white text-[#6B3E26] border-[#e8c4a0] hover:bg-[#FFF0E6]"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = active
                                              ? opciones.toppings.filter((x) => x.ingredienteId !== t.ingredienteId)
                                              : [...opciones.toppings, { ingredienteId: t.ingredienteId }];
                                            update("toppings", next);
                                          }}
                                          className="flex items-center gap-2 cursor-pointer"
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
                                          {!active && <span className="opacity-60">{t.cantidad}{t.unidad}</span>}
                                        </button>
                                        {active && sel && (
                                          <span
                                            className="flex items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <input
                                              type="number"
                                              min={0}
                                              value={sel.cantidad ?? t.cantidad ?? 0}
                                              onChange={(e) => {
                                                const n = Number(e.target.value);
                                                update(
                                                  "toppings",
                                                  opciones.toppings.map((x) =>
                                                    x.ingredienteId === t.ingredienteId
                                                      ? { ...x, cantidad: Number.isFinite(n) && n >= 0 ? n : 0 }
                                                      : x,
                                                  ),
                                                );
                                              }}
                                              aria-label={`Cantidad de ${t.nombre}`}
                                              className="w-12 bg-white/20 rounded text-white text-center focus:outline-none focus:bg-white/30 transition"
                                            />
                                            <span className="opacity-80">{t.unidad}</span>
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                {catalogo.toppings.filter((t) => t.cantidad != null).length === 0 && (
                                  <p className="text-xs text-[#AA6A42]/50">Sin toppings disponibles</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ── Ornamentos ── */}
                          {catalogo.ornamentos.length > 0 && (
                            <div>
                              <Label>Ornamentos</Label>
                              <div className="flex flex-wrap gap-2">
                                {catalogo.ornamentos.map((o) => {
                                  const sel = opciones.ornamentos.find((x) => x.ornamentoId === o.id);
                                  const active = !!sel;
                                  return (
                                    <div
                                      key={o.id}
                                      className={`flex items-center gap-1.5 rounded-xl text-xs font-semibold border transition ${
                                        o.imagenUrl ? "pl-1.5 pr-2 py-1.5" : "px-3 py-1.5"
                                      } ${
                                        active
                                          ? "bg-[#DA6C94] text-white border-[#DA6C94]"
                                          : "bg-white text-[#6B3E26] border-[#e8c4a0] hover:bg-[#FFF0E6]"
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = active
                                            ? opciones.ornamentos.filter((x) => x.ornamentoId !== o.id)
                                            : [...opciones.ornamentos, { ornamentoId: o.id, cantidad: 1 }];
                                          update("ornamentos", next);
                                        }}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        {o.imagenUrl && (
                                          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                            <Image
                                              src={o.imagenUrl}
                                              alt={o.nombre}
                                              fill
                                              className="object-cover"
                                              sizes="32px"
                                            />
                                          </div>
                                        )}
                                        <span>{o.nombre}</span>
                                        <span className="opacity-60">+${o.precio.toFixed(0)}</span>
                                      </button>
                                      {active && sel && (
                                        <span className="flex items-center gap-0.5 bg-white/25 rounded-full">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              update(
                                                "ornamentos",
                                                opciones.ornamentos.map((x) =>
                                                  x.ornamentoId === o.id
                                                    ? { ...x, cantidad: Math.max(1, x.cantidad - 1) }
                                                    : x,
                                                ),
                                              )
                                            }
                                            className="w-6 h-6 flex items-center justify-center cursor-pointer"
                                            aria-label={`Quitar una unidad de ${o.nombre}`}
                                          >
                                            −
                                          </button>
                                          <span className="w-5 text-center">{sel.cantidad}</span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              update(
                                                "ornamentos",
                                                opciones.ornamentos.map((x) =>
                                                  x.ornamentoId === o.id
                                                    ? { ...x, cantidad: Math.min(99, x.cantidad + 1) }
                                                    : x,
                                                ),
                                              )
                                            }
                                            className="w-6 h-6 flex items-center justify-center cursor-pointer"
                                            aria-label={`Agregar una unidad de ${o.nombre}`}
                                          >
                                            +
                                          </button>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                      className="px-3 py-2 min-h-11 rounded-xl bg-[#FFF0E6] border border-[#e8c4a0] text-[#AA6A42] text-sm font-semibold cursor-pointer hover:bg-[#fde8d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    <p className="mt-1 text-[11px] text-[#AA6A42]/50">
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
                        className="w-11 h-11 rounded-lg border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold cursor-pointer hover:bg-[#fde8d0] transition-colors flex items-center justify-center"
                      >−</button>
                      <span className="text-sm font-bold text-[#3A1F14] w-6 text-center">{cantidad}</span>
                      <button
                        onClick={() => setCantidad(cantidad + 1)}
                        className="w-11 h-11 rounded-lg border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold cursor-pointer hover:bg-[#fde8d0] transition-colors flex items-center justify-center"
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
                          <p className="text-[11px] text-[#AA6A42]/60">${precioBase.toFixed(0)} c/u</p>
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
                className="flex-1 py-2.5 min-h-11 rounded-xl border border-[#e8c4a0] text-[#AA6A42] text-sm font-semibold hover:bg-[#FFF0E6] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!desglose || loading || justAdded}
                className={`flex-1 py-2.5 min-h-11 rounded-xl text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                  justAdded
                    ? "bg-[#1B7A43]"
                    : "bg-[#A84D66] hover:bg-[#8f3f54] disabled:opacity-50"
                }`}
              >
                {justAdded ? (
                  <>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {editItem ? "Cambios guardados" : "Agregado"}
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
                    <span>{editItem ? "Guardar cambios" : "Agregar al carrito"}</span>
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
