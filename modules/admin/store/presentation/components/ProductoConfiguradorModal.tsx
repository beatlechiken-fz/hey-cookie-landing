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
import type { Producto } from "../../domain/entities/Producto.entity";

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

  // Cuando cambia el producto, resetear la selección de precio
  // Si el producto tiene precio_establecido, lo preseleccionamos
  const tieneEstablecido = Boolean(producto?.precioEstablecido);

  // Precio que se mostrará y se usará en el carrito
  const precioFinal = (() => {
    if (!desglose) return 0;
    if (tieneEstablecido && usarPrecioEstablecido)
      return producto!.precioEstablecido!;
    return desglose.precioSugerido;
  })();

  const open = Boolean(producto);
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4a0] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  function handleClose() {
    reset();
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
      },
      cantidad,
      costoUnitario: desglose.costoProduccionTotal,
      precioUnitario: precioFinal,
      desgloseCostos: {
        costoInsumos: desglose.costoInsumos,
        cargosAdicionales: desglose.cargosAdicionales,
        costoProduccionTotal: desglose.costoProduccionTotal,
        precioSugerido: desglose.precioSugerido,
        precioEstablecido: producto.precioEstablecido ?? null,
        precioUsado:
          usarPrecioEstablecido && tieneEstablecido
            ? "establecido"
            : "sugerido",
      },
      cuponesItem: editItem?.cuponesItem ?? [],
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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#f0e0d0] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e0d0] bg-[#FFF7F0] shrink-0">
                <div>
                  <h2 className="font-bold text-[#AA6A42] text-lg">
                    {editItem ? `Editar: ${producto.nombre}` : producto.nombre}
                  </h2>
                  {producto.descripcion && (
                    <p className="text-[12px] text-[#6B3E26] mt-0.5 line-clamp-1">
                      {producto.descripcion}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-[#f0e0d0] transition text-[#6B3E26]"
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
                  <p className="text-center text-[#AA6A42] text-sm py-8">
                    Cargando…
                  </p>
                )}
                {error && (
                  <p className="text-center text-red-500 text-sm py-8">
                    {error}
                  </p>
                )}

                {!loading && !error && catalogo && (
                  <div className="flex flex-col gap-5">
                    {/* Medida personalizada */}
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
                          <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
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
                                    ? "bg-[#c0607a] text-white border-[#c0607a]"
                                    : "bg-white text-[#AA6A42] border-[#e8c4a0] hover:bg-[#FFF7F0]")
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
                        <div className="rounded-xl bg-[#FFF7F0] border border-[#f0e0d0] px-3 py-2.5">
                          <p className="text-[12px] text-[#AA6A42]">
                            Este producto tiene un tamaño único
                            {producto.medidaBaseCm
                              ? ` (${producto.medidaBaseCm}cm)`
                              : ""}
                            .
                          </p>
                        </div>
                      )}

                    <div className="h-px bg-[#f0e0d0]" />

                    {/* Grid de selectores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
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
                      </div>

                      <div className="sm:col-span-2">
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
                      </div>

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

                    <div className="h-px bg-[#f0e0d0]" />

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
                          <span className="text-[12px] text-[#6B3E26] shrink-0">{t.nombre}:</span>
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
                            className="w-20 px-2 py-1 rounded-lg border border-[#e8c4a0] bg-white text-[#3d1a24] text-[12px] font-semibold text-center focus:outline-none focus:border-[#c0607a]"
                          />
                          <span className="text-[11px] text-[#6B3E26]">{t.unidad}</span>
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
                              className="text-[11px] text-[#AA6A42] underline hover:text-[#8A5535] transition cursor-pointer"
                            >
                              Restablecer ({t.cantidad}{t.unidad})
                            </button>
                          )}
                        </div>
                      );
                    })}

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

                    <div className="h-px bg-[#f0e0d0]" />

                    {/* Cantidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                          Cantidad
                        </p>
                        <p className="text-[11px] text-[#6B3E26] mt-0.5">
                          Número de unidades con esta configuración
                        </p>
                      </div>
                      <QuantityStepper
                        value={cantidad}
                        onChange={setCantidad}
                      />
                    </div>

                    <div className="h-px bg-[#f0e0d0]" />

                    {/* Desglose de costos */}
                    {desglose && (
                      <CostoDesgloseTable
                        desglose={desglose}
                        cantidad={cantidad}
                      />
                    )}

                    {/* ── Selector de precio ───────────────────────────── */}
                    {desglose && tieneEstablecido && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                          Precio a usar
                        </p>
                        <div className="flex gap-2">
                          {/* Sugerido */}
                          <button
                            type="button"
                            onClick={() => setUsarPrecioEstablecido(false)}
                            className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl border-2 transition ${
                              !usarPrecioEstablecido
                                ? "border-[#c0607a] bg-[#FFF7F0]"
                                : "border-[#e8c4a0] bg-white hover:bg-[#fdf9fb]"
                            }`}
                          >
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wide ${!usarPrecioEstablecido ? "text-[#c0607a]" : "text-[#6B3E26]"}`}
                            >
                              Precio sugerido
                            </span>
                            <span
                              className={`text-lg font-bold mt-0.5 ${!usarPrecioEstablecido ? "text-[#AA6A42]" : "text-[#6B3E26]"}`}
                            >
                              ${desglose.precioSugerido.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-[#AA6A42] mt-0.5">
                              Calculado del desglose
                            </span>
                          </button>

                          {/* Establecido */}
                          <button
                            type="button"
                            onClick={() => setUsarPrecioEstablecido(true)}
                            className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl border-2 transition ${
                              usarPrecioEstablecido
                                ? "border-[#c0607a] bg-[#FFF7F0]"
                                : "border-[#e8c4a0] bg-white hover:bg-[#fdf9fb]"
                            }`}
                          >
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wide ${usarPrecioEstablecido ? "text-[#c0607a]" : "text-[#6B3E26]"}`}
                            >
                              Precio establecido
                            </span>
                            <span
                              className={`text-lg font-bold mt-0.5 ${usarPrecioEstablecido ? "text-[#AA6A42]" : "text-[#6B3E26]"}`}
                            >
                              ${producto.precioEstablecido!.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-[#AA6A42] mt-0.5">
                              Definido manualmente
                            </span>
                          </button>
                        </div>

                        {/* Total con el precio elegido */}
                        {cantidad > 1 && (
                          <div className="flex justify-between items-center px-1 text-[13px]">
                            <span className="text-[#6B3E26]">
                              Total ({cantidad} unidades)
                            </span>
                            <span className="font-bold text-[#c0607a]">
                              ${(precioFinal * cantidad).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Si no tiene precio establecido, mostrar solo el precio final */}
                    {desglose && !tieneEstablecido && cantidad > 1 && (
                      <div className="flex justify-between items-center px-1 text-[13px]">
                        <span className="text-[#6B3E26]">
                          Total ({cantidad} unidades)
                        </span>
                        <span className="font-bold text-[#c0607a]">
                          ${(desglose.precioSugerido * cantidad).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 px-6 py-4 border-t border-[#f0e0d0] bg-white shrink-0">
                {saveError && (
                  <p className="text-[12px] text-[#C0392B] text-center">{saveError}</p>
                )}
                <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4a0] text-[#6B3E26] text-sm font-semibold hover:bg-[#FFF7F0] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!desglose || loading || saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition flex items-center justify-center gap-2"
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
                      {desglose && (
                        <span className="opacity-90 text-[13px] font-semibold">
                          · ${precioFinal.toFixed(2)}
                        </span>
                      )}
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
