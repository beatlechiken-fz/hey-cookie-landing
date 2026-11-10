"use client";
// src/modules/admin/productos/presentation/components/ProductoConfiguradorModal.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductoConfigurador } from "../hooks/useProductoConfigurador";
import { useCartStore, type CartItem } from "../hooks/useCartStore";
import {
  SelectField,
  NINGUNO,
} from "@/modules/admin/store/presentation/components/configurador/SelectField";
import { MultiSelectField } from "./configurador/MultiselectField";
import { MultiCoberturaField } from "./configurador/MultiCoberturaField";
import { MultiSelectQuantityField } from "./configurador/MultiSelectQuantityField";
import { QuantityStepper } from "@/modules/admin/store/presentation/components/configurador/QuantityStepper";
import { CostoDesgloseTable } from "./configurador/CostoDesgloceTable";
import { DiametroPersonasSelector } from "@/modules/admin/store/presentation/components/configurador/DiametroPersonasSelector";
import { personasDesdeDiametro } from "../../domain/entities/PastelMedida.entity";
import {
  getPrecioEstablecidoEfectivo,
  type Producto,
} from "../../domain/entities/Producto.entity";

type SeccionId =
  | "tamano"
  | "coberturas"
  | "rellenos"
  | "jarabe"
  | "toppings"
  | "empaques"
  | "ornamentos"
  | "precio";

/**
 * Sección colapsable del configurador. Muestra lo elegido en el encabezado
 * para que se lea la configuración completa sin abrir cada una.
 */
function Seccion({
  id,
  titulo,
  resumen,
  abierta,
  onToggle,
  children,
}: {
  id: SeccionId;
  titulo: string;
  resumen?: string | null;
  abierta: SeccionId | null;
  onToggle: (id: SeccionId) => void;
  children: React.ReactNode;
}) {
  const expandida = abierta === id;
  return (
    <section
      className={`rounded-xl border transition-colors ${
        expandida ? "border-hc-rose/40 bg-white" : "border-hc-line bg-hc-hover/40"
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={expandida}
          aria-controls={`seccion-${id}`}
          className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer"
        >
          <span className="text-[13px] font-semibold text-hc-ink shrink-0">{titulo}</span>
          <span className="min-w-0 flex-1 truncate text-right text-[12px] text-hc-muted">
            {resumen ?? "Ninguno"}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 shrink-0 text-hc-muted transition-transform ${expandida ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {expandida && (
          <motion.div
            id={`seccion-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-hc-line px-4 pb-4 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface Props {
  producto: Producto | null;
  onClose: () => void;
  /** Item del carrito a editar — si viene, precarga la config y guarda in-place en vez de agregar uno nuevo. */
  editItem?: CartItem | null;
  /** Igual que en PastelConfiguradorModal — para editar una partida de una orden ya generada. */
  onSave?: (payload: Omit<CartItem, "id" | "origen" | "productoId">) => Promise<void> | void;
}

export function ProductoConfiguradorModal({ producto, onClose, editItem, onSave }: Props) {
  const {
    catalogo,
    loading,
    error,
    opciones,
    diametroCm,
    tamanoFijoId,
    cantidad,
    setOpciones,
    setDiametroCm,
    setTamanoFijoId,
    setCantidad,
    update,
    reset,
    desglose,
  } = useProductoConfigurador(producto);

  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const [added, setAdded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // En modo edición, sobreescribe los defaults del producto con la config guardada en el carrito.
  useEffect(() => {
    if (!producto || !editItem) return;
    // any: configuracion guardada es un objeto plano {productoId, opciones,
    // diametroCm, tamanoFijoId} sin tipo dedicado — se lee tal cual se guardó.
    const conf = editItem.configuracion as Record<string, any>;
    if (conf.opciones) setOpciones(conf.opciones);
    if (conf.diametroCm != null) setDiametroCm(conf.diametroCm);
    if (conf.tamanoFijoId !== undefined) setTamanoFijoId(conf.tamanoFijoId);
    setCantidad(editItem.cantidad);
  }, [producto, editItem, setOpciones, setDiametroCm, setTamanoFijoId, setCantidad]);

  // ── Precio: sugerido vs establecido ───────────────────────────────────────
  // "sugerido" = precio calculado del desglose
  // "establecido" = precio_establecido del producto (si existe)
  const [usarPrecioEstablecido, setUsarPrecioEstablecido] = useState(false);

  // Precio establecido efectivo: el de la variante de tamaño elegida si
  // define uno propio, si no el del producto.
  const precioEstablecidoEfectivo = producto
    ? getPrecioEstablecidoEfectivo(producto, tamanoFijoId)
    : null;

  // Cuando cambia el producto, resetear la selección de precio
  // Si el producto (o su variante) tiene precio establecido, lo preseleccionamos
  const tieneEstablecido = precioEstablecidoEfectivo != null;

  // Precio que se mostrará y se usará en el carrito
  const precioFinal = (() => {
    if (!desglose) return 0;
    if (tieneEstablecido && usarPrecioEstablecido)
      return precioEstablecidoEfectivo!;
    return desglose.precioSugerido;
  })();

  // ── Secciones en acordeón: solo una abierta a la vez (Tamaño al inicio) ──
  const [abierta, setAbierta] = useState<SeccionId | null>("tamano");
  const toggle = (id: SeccionId) => setAbierta((a) => (a === id ? null : id));

  // Resumen de lo elegido en cada sección (se ve aunque esté colapsada)
  const nombres = (ids: (string | null | undefined)[], lista: { id: string; nombre: string }[] = []) =>
    ids.map((id) => lista.find((x) => x.id === id)?.nombre).filter(Boolean).join(", ") || null;
  const resumenTamano = !producto
    ? null
    : producto.permiteMedidaPersonalizada
      ? `${personasDesdeDiametro(diametroCm, producto.medidaBaseCm ?? 24)} personas · ${diametroCm}cm`
      : producto.tamanosFijos.find((t) => t.id === tamanoFijoId)?.nombre ?? "Tamaño único";
  const resumenCoberturas = nombres(opciones.coberturas.map((c) => c.coberturaId), catalogo?.coberturas);
  const resumenRellenos = nombres(opciones.rellenos.map((r) => r.rellenoId), catalogo?.coberturas);
  const resumenJarabe =
    [
      nombres([opciones.jarabeId], catalogo?.jarabes),
      catalogo?.licores.find((l) => l.ingredienteId === opciones.licorId)?.nombre,
    ]
      .filter(Boolean)
      .join(" · ") || null;
  const resumenToppings = nombres(
    opciones.toppings.map((t) => t.ingredienteId),
    catalogo?.toppings.map((t) => ({ id: t.ingredienteId, nombre: t.nombre })),
  );
  const resumenEmpaques = nombres(opciones.empaqueIds, catalogo?.empaques);
  const resumenOrnamentos =
    opciones.ornamentos
      .map((o) => {
        const n = catalogo?.ornamentos.find((x) => x.id === o.ornamentoId)?.nombre;
        return n ? (o.cantidad > 1 ? `${n} ×${o.cantidad}` : n) : null;
      })
      .filter(Boolean)
      .join(", ") || null;

  const open = Boolean(producto);
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-sm focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition";

  function handleClose() {
    reset();
    setAbierta("tamano");
    setAdded(false);
    setUsarPrecioEstablecido(false);
    onClose();
  }

  async function handleAddToCart() {
    if (!desglose || !producto) return;

    const tamanoFijo = producto.tamanosFijos.find((t) => t.id === tamanoFijoId);
    const sufijoNombre = producto.permiteMedidaPersonalizada
      ? ` (${personasDesdeDiametro(diametroCm, producto.medidaBaseCm ?? 24)} personas)`
      : tamanoFijo
        ? ` (${tamanoFijo.nombre})`
        : "";

    // Descarta filas de cobertura/relleno que se agregaron pero se dejaron sin elegir.
    const opcionesLimpias = {
      ...opciones,
      coberturas: opciones.coberturas.filter((c) => c.coberturaId),
      rellenos: opciones.rellenos.filter((r) => r.rellenoId),
    };

    const base = {
      nombre: `${producto.nombre}${sufijoNombre}`,
      configuracion: {
        productoId: producto.id,
        opciones: opcionesLimpias,
        diametroCm: producto.permiteMedidaPersonalizada ? diametroCm : null,
        tamanoFijoId: tamanoFijo ? tamanoFijo.id : null,
        // La promo (ej. viernes 2×$40) solo aplica cobrando el precio establecido.
        promo:
          usarPrecioEstablecido && tieneEstablecido ? producto.promo : null,
      },
      cantidad,
      costoUnitario: desglose.costoProduccionTotal,
      precioUnitario: precioFinal,
      desgloseCostos: {
        costoInsumos: desglose.costoInsumos,
        cargosAdicionales: desglose.cargosAdicionales,
        costoProduccionTotal: desglose.costoProduccionTotal,
        precioSugerido: desglose.precioSugerido,
        precioEstablecido: precioEstablecidoEfectivo,
        precioUsado:
          usarPrecioEstablecido && tieneEstablecido
            ? "establecido"
            : "sugerido",
      },
      cuponesItem: editItem?.cuponesItem ?? [],
      observaciones: editItem?.observaciones ?? null,
    };

    if (onSave) {
      setSaveError(null);
      setSaving(true);
      try {
        await onSave(base);
      } catch (e: any) {
        setSaveError(e.message ?? "No se pudo guardar el cambio");
        setSaving(false);
        return;
      }
      setSaving(false);
      setAdded(true);
      setTimeout(() => handleClose(), 900);
      return;
    }

    const payload = { ...base, origen: "producto-configurador" as const, productoId: producto.id };
    if (editItem) updateItem(editItem.id, payload);
    else addItem(payload);
    setAdded(true);
    setTimeout(() => handleClose(), 900);
  }

  return (
    <AnimatePresence>
      {open && producto && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-hc-cacao/25 backdrop-blur-[2px] z-40"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-hc-line bg-hc-hover shrink-0">
                <div>
                  <h2 className="font-bold text-hc-soft text-lg">
                    {editItem ? `Editar: ${producto.nombre}` : producto.nombre}
                  </h2>
                  {producto.descripcion && (
                    <p className="text-[12px] text-hc-muted mt-0.5 line-clamp-1">
                      {producto.descripcion}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-hc-sunken transition text-hc-muted"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {loading && (
                  <p className="text-center text-hc-soft text-sm py-8">
                    Cargando…
                  </p>
                )}
                {error && (
                  <p className="text-center text-red-500 text-sm py-8">
                    {error}
                  </p>
                )}

                {!loading && !error && catalogo && (
                  <div className="flex flex-col gap-2">
                    <Seccion id="tamano" titulo="Tamaño" resumen={resumenTamano} abierta={abierta} onToggle={toggle}>
                        {producto.permiteMedidaPersonalizada && (
                          <DiametroPersonasSelector
                            diametroCm={diametroCm}
                            medidaBaseCm={producto.medidaBaseCm ?? 24}
                            onChange={setDiametroCm}
                          />
                        )}

                        {/* Tamaños fijos */}
                        {!producto.permiteMedidaPersonalizada &&
                          producto.tamanosFijos.length > 0 && (
                            <div className="flex flex-col gap-2">
                              <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                                Tamaño
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {producto.tamanosFijos.map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTamanoFijoId(t.id)}
                                    className={
                                      "px-4 py-2 rounded-xl text-[13px] font-semibold border transition " +
                                      (tamanoFijoId === t.id
                                        ? "bg-hc-rose text-white border-hc-rose"
                                        : "bg-white text-hc-soft border-hc-line-strong hover:bg-hc-hover")
                                    }
                                  >
                                    {t.nombre}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Tamaño único */}
                        {!producto.permiteMedidaPersonalizada &&
                          producto.tamanosFijos.length === 0 && (
                            <div className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
                              <p className="text-[12px] text-hc-soft">
                                Este producto tiene un tamaño único
                                {producto.medidaBaseCm
                                  ? ` (${producto.medidaBaseCm}cm)`
                                  : ""}
                                .
                              </p>
                            </div>
                          )}
                    </Seccion>

                    <Seccion id="coberturas" titulo="Coberturas" resumen={resumenCoberturas} abierta={abierta} onToggle={toggle}>
                        <MultiCoberturaField
                          label="Coberturas"
                          items={opciones.coberturas.map((c) => ({
                            id: c.coberturaId,
                            saborId: c.saborCoberturaId,
                            factor: c.factor ?? 1,
                          }))}
                          onChange={(items) =>
                            update(
                              "coberturas",
                              items.map((it) => ({
                                coberturaId: it.id,
                                saborCoberturaId: it.saborId,
                                factor: it.factor ?? 1,
                              })),
                            )
                          }
                          options={catalogo.coberturas.map((c) => ({
                            value: c.id,
                            label: c.nombre,
                          }))}
                          sabores={catalogo.saboresCobertura.map((s) => ({
                            value: s.id,
                            label: s.nombre,
                            sublabel:
                              s.precio != null ? `+$${s.precio}` : undefined,
                          }))}
                          addLabel="+ Agregar cobertura"
                        />
                    </Seccion>

                    <Seccion id="rellenos" titulo="Rellenos" resumen={resumenRellenos} abierta={abierta} onToggle={toggle}>
                        <MultiCoberturaField
                          label="Rellenos"
                          items={opciones.rellenos.map((r) => ({
                            id: r.rellenoId,
                            saborId: r.saborRellenoId,
                            factor: r.factor ?? 1,
                          }))}
                          onChange={(items) =>
                            update(
                              "rellenos",
                              items.map((it) => ({
                                rellenoId: it.id,
                                saborRellenoId: it.saborId,
                                factor: it.factor ?? 1,
                              })),
                            )
                          }
                          options={catalogo.coberturas.map((c) => ({
                            value: c.id,
                            label: c.nombre,
                          }))}
                          sabores={catalogo.saboresCobertura.map((s) => ({
                            value: s.id,
                            label: s.nombre,
                            sublabel:
                              s.precio != null ? `+$${s.precio}` : undefined,
                          }))}
                          addLabel="+ Agregar relleno"
                        />
                    </Seccion>

                    <Seccion id="jarabe" titulo="Jarabe y licor" resumen={resumenJarabe} abierta={abierta} onToggle={toggle}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <SelectField
                            label="Jarabe"
                            value={opciones.jarabeId ?? NINGUNO}
                            options={catalogo.jarabes.map((j) => ({
                              value: j.id,
                              label: j.nombre,
                            }))}
                            onChange={(v) =>
                              update("jarabeId", v === NINGUNO ? null : v)
                            }
                          />

                          <SelectField
                            label="Sabor de jarabe"
                            value={opciones.saborJarabeId ?? NINGUNO}
                            options={catalogo.saboresJarabe.map((s) => ({
                              value: s.id,
                              label: s.nombre,
                              sublabel:
                                s.precio != null ? `+$${s.precio}` : undefined,
                            }))}
                            onChange={(v) =>
                              update("saborJarabeId", v === NINGUNO ? null : v)
                            }
                          />

                          <SelectField
                            label="Licor"
                            value={opciones.licorId ?? NINGUNO}
                            options={catalogo.licores
                              .filter((l) => l.cantidad != null)
                              .map((l) => ({
                                value: l.ingredienteId,
                                label: l.nombre,
                                sublabel: `${l.cantidad}ml`,
                              }))}
                            onChange={(v) =>
                              update("licorId", v === NINGUNO ? null : v)
                            }
                          />
                      </div>
                    </Seccion>

                    <Seccion id="toppings" titulo="Toppings" resumen={resumenToppings} abierta={abierta} onToggle={toggle}>
                      <div className="flex flex-col gap-3">
                          <MultiSelectField
                            label="Toppings"
                            values={opciones.toppings.map((t) => t.ingredienteId)}
                            options={catalogo.toppings
                              .filter((t) => t.cantidad != null)
                              .map((t) => ({
                                value: t.ingredienteId,
                                label: t.nombre,
                                sublabel: `${t.cantidad}${t.unidad}`,
                              }))}
                            onChange={(ids) =>
                              update(
                                "toppings",
                                ids.map(
                                  (id) =>
                                    opciones.toppings.find((t) => t.ingredienteId === id) ?? {
                                      ingredienteId: id,
                                    },
                                ),
                              )
                            }
                          />
                          {/* Cantidad ajustable por topping — override manual solo para esta orden */}
                          {opciones.toppings.map((sel) => {
                            const t = catalogo.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
                            if (!t || t.cantidad == null) return null;
                            const overridden = sel.cantidad != null;
                            return (
                              <div key={sel.ingredienteId} className="flex items-center gap-2 -mt-1">
                                <span className="text-[12px] text-hc-muted shrink-0">{t.nombre}:</span>
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={sel.cantidad ?? t.cantidad}
                                  onChange={(e) => {
                                    const n = Number(e.target.value);
                                    update(
                                      "toppings",
                                      opciones.toppings.map((x) =>
                                        x.ingredienteId === sel.ingredienteId
                                          ? { ...x, cantidad: Number.isFinite(n) && n >= 0 ? n : 0 }
                                          : x,
                                      ),
                                    );
                                  }}
                                  className="w-20 px-2 py-1 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-[12px] font-semibold text-center focus:outline-none focus:border-hc-rose"
                                />
                                <span className="text-[11px] text-hc-muted">{t.unidad}</span>
                                {overridden && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      update(
                                        "toppings",
                                        opciones.toppings.map((x) =>
                                          x.ingredienteId === sel.ingredienteId ? { ...x, cantidad: undefined } : x,
                                        ),
                                      )
                                    }
                                    className="text-[11px] text-hc-soft underline hover:text-hc-ink transition cursor-pointer"
                                  >
                                    Restablecer ({t.cantidad}{t.unidad})
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </Seccion>

                    <Seccion id="empaques" titulo="Empaques" resumen={resumenEmpaques} abierta={abierta} onToggle={toggle}>
                        <MultiSelectField
                          label="Empaques"
                          values={opciones.empaqueIds}
                          options={catalogo.empaques.map((e) => ({
                            value: e.id,
                            label: e.nombre,
                            sublabel: `$${e.precio}`,
                          }))}
                          onChange={(v) => update("empaqueIds", v)}
                        />
                    </Seccion>

                    <Seccion id="ornamentos" titulo="Ornamentos" resumen={resumenOrnamentos} abierta={abierta} onToggle={toggle}>
                        <MultiSelectQuantityField
                          label="Ornamentos"
                          items={opciones.ornamentos.map((o) => ({
                            id: o.ornamentoId,
                            cantidad: o.cantidad,
                          }))}
                          options={catalogo.ornamentos.map((o) => ({
                            value: o.id,
                            label: o.nombre,
                            sublabel: `$${o.precio}`,
                          }))}
                          onChange={(items) =>
                            update(
                              "ornamentos",
                              items.map((it) => ({
                                ornamentoId: it.id,
                                cantidad: it.cantidad,
                              })),
                            )
                          }
                        />
                    </Seccion>

                    <Seccion id="precio" titulo="Costos y precio" resumen={desglose ? `$${precioFinal.toFixed(2)} c/u` : null} abierta={abierta} onToggle={toggle}>
                      <div className="flex flex-col gap-4">
                          {desglose && (
                            <CostoDesgloseTable
                              desglose={desglose}
                              cantidad={cantidad}
                            />
                          )}

                          {desglose && tieneEstablecido && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                                Precio a usar
                              </p>
                              <div className="flex gap-2">
                                {/* Sugerido */}
                                <button
                                  type="button"
                                  onClick={() => setUsarPrecioEstablecido(false)}
                                  className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl border-2 transition ${
                                    !usarPrecioEstablecido
                                      ? "border-hc-rose bg-hc-hover"
                                      : "border-hc-line-strong bg-white hover:bg-hc-rose-tint"
                                  }`}
                                >
                                  <span
                                    className={`text-[11px] font-semibold uppercase tracking-wide ${!usarPrecioEstablecido ? "text-hc-rose" : "text-hc-muted"}`}
                                  >
                                    Precio sugerido
                                  </span>
                                  <span
                                    className={`text-lg font-bold mt-0.5 ${!usarPrecioEstablecido ? "text-hc-soft" : "text-hc-muted"}`}
                                  >
                                    ${desglose.precioSugerido.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-hc-soft mt-0.5">
                                    Calculado del desglose
                                  </span>
                                </button>

                                {/* Establecido */}
                                <button
                                  type="button"
                                  onClick={() => setUsarPrecioEstablecido(true)}
                                  className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl border-2 transition ${
                                    usarPrecioEstablecido
                                      ? "border-hc-rose bg-hc-hover"
                                      : "border-hc-line-strong bg-white hover:bg-hc-rose-tint"
                                  }`}
                                >
                                  <span
                                    className={`text-[11px] font-semibold uppercase tracking-wide ${usarPrecioEstablecido ? "text-hc-rose" : "text-hc-muted"}`}
                                  >
                                    Precio establecido
                                  </span>
                                  <span
                                    className={`text-lg font-bold mt-0.5 ${usarPrecioEstablecido ? "text-hc-soft" : "text-hc-muted"}`}
                                  >
                                    ${precioEstablecidoEfectivo!.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-hc-soft mt-0.5">
                                    Definido manualmente
                                  </span>
                                </button>
                              </div>

                            </div>
                          )}
                      </div>
                    </Seccion>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 px-6 py-4 border-t border-hc-line bg-white shrink-0">
                {/* Cantidad junto al precio — siempre visible */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                      Cantidad
                    </span>
                    <QuantityStepper value={cantidad} onChange={setCantidad} />
                  </div>
                  {desglose && (
                    <div className="text-right leading-tight">
                      <p className="text-xl font-bold text-hc-ink tabular-nums">
                        ${(precioFinal * cantidad).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-hc-muted">
                        {cantidad > 1
                          ? `${cantidad} × $${precioFinal.toFixed(2)}`
                          : usarPrecioEstablecido && tieneEstablecido
                            ? "Precio establecido"
                            : "Precio sugerido"}
                      </p>
                    </div>
                  )}
                </div>
                {saveError && (
                  <p className="text-[12px] text-[#C0392B] text-center">{saveError}</p>
                )}
                <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-hc-line-strong text-hc-muted text-sm font-semibold hover:bg-hc-hover transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!desglose || loading || saving}
                  className="flex-1 py-2.5 rounded-xl bg-hc-rose text-white text-sm font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {saving ? "Guardando…" : added ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {editItem ? "Cambios guardados" : "Agregado al carrito"}
                    </>
                  ) : (
                    <>
                      {editItem ? "Guardar cambios" : "Agregar"}
                    </>
                  )}
                </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
