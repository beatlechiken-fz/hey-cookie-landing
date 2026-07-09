"use client";
// src/modules/admin/productos/presentation/components/ProductoConfiguradorModal.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductoConfigurador } from "../hooks/useProductoConfigurador";
import { useCartStore } from "../hooks/useCartStore";
import {
  SelectField,
  NINGUNO,
} from "@/modules/admin/store/presentation/components/configurador/SelectField";
import { MultiSelectField } from "./configurador/MultiselectField";
import { QuantityStepper } from "@/modules/admin/store/presentation/components/configurador/QuantityStepper";
import { CostoDesgloseTable } from "./configurador/CostoDesgloceTable";
import { DiametroPersonasSelector } from "@/modules/admin/store/presentation/components/configurador/DiametroPersonasSelector";
import { personasDesdeDiametro } from "../../domain/entities/PastelMedida.entity";
import type { Producto } from "../../domain/entities/Producto.entity";

interface Props {
  producto: Producto | null;
  onClose: () => void;
}

export function ProductoConfiguradorModal({ producto, onClose }: Props) {
  const {
    catalogo,
    loading,
    error,
    opciones,
    diametroCm,
    tamanoFijoId,
    cantidad,
    setDiametroCm,
    setTamanoFijoId,
    setCantidad,
    update,
    reset,
    desglose,
  } = useProductoConfigurador(producto);

  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

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
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  function handleClose() {
    reset();
    setAdded(false);
    setUsarPrecioEstablecido(false);
    onClose();
  }

  function handleAddToCart() {
    if (!desglose || !producto) return;

    const tamanoFijo = producto.tamanosFijos.find((t) => t.id === tamanoFijoId);
    const sufijoNombre = producto.permiteMedidaPersonalizada
      ? ` (${personasDesdeDiametro(diametroCm, producto.medidaBaseCm ?? 24)} personas)`
      : tamanoFijo
        ? ` (${tamanoFijo.nombre})`
        : "";

    addItem({
      nombre: `${producto.nombre}${sufijoNombre}`,
      configuracion: {
        productoId: producto.id,
        opciones: { ...opciones },
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
      cuponesItem: [],
    });
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
            <div className="pointer-events-auto w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#f5dce4] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <div>
                  <h2 className="font-bold text-[#7b2d42] text-lg">
                    {producto.nombre}
                  </h2>
                  {producto.descripcion && (
                    <p className="text-[12px] text-[#b07a8a] mt-0.5 line-clamp-1">
                      {producto.descripcion}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
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
                  <p className="text-center text-[#c0a0a8] text-sm py-8">
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
                          <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
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
                                    : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]")
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
                        <div className="rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-3 py-2.5">
                          <p className="text-[12px] text-[#7b2d42]">
                            Este producto tiene un tamaño único
                            {producto.medidaBaseCm
                              ? ` (${producto.medidaBaseCm}cm)`
                              : ""}
                            .
                          </p>
                        </div>
                      )}

                    <div className="h-px bg-[#f5dce4]" />

                    {/* Grid de selectores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField
                        label="Cobertura"
                        value={opciones.coberturaId ?? NINGUNO}
                        options={catalogo.coberturas.map((c) => ({
                          value: c.id,
                          label: c.nombre,
                        }))}
                        onChange={(v) =>
                          update("coberturaId", v === NINGUNO ? null : v)
                        }
                      />

                      <SelectField
                        label="Sabor de cobertura"
                        value={opciones.saborCoberturaId ?? NINGUNO}
                        options={catalogo.saboresCobertura.map((s) => ({
                          value: s.id,
                          label: s.nombre,
                          sublabel:
                            s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                        onChange={(v) =>
                          update("saborCoberturaId", v === NINGUNO ? null : v)
                        }
                      />

                      <SelectField
                        label="Relleno"
                        value={opciones.rellenoId ?? NINGUNO}
                        options={catalogo.coberturas.map((c) => ({
                          value: c.id,
                          label: c.nombre,
                        }))}
                        onChange={(v) =>
                          update("rellenoId", v === NINGUNO ? null : v)
                        }
                      />

                      <SelectField
                        label="Sabor de relleno"
                        value={opciones.saborRellenoId ?? NINGUNO}
                        options={catalogo.saboresCobertura.map((s) => ({
                          value: s.id,
                          label: s.nombre,
                          sublabel:
                            s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                        onChange={(v) =>
                          update("saborRellenoId", v === NINGUNO ? null : v)
                        }
                      />

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

                    <div className="h-px bg-[#f5dce4]" />

                    <MultiSelectField
                      label="Toppings"
                      values={opciones.toppingIds}
                      options={catalogo.toppings
                        .filter((t) => t.cantidad != null)
                        .map((t) => ({
                          value: t.ingredienteId,
                          label: t.nombre,
                          sublabel: `${t.cantidad}${t.unidad}`,
                        }))}
                      onChange={(v) => update("toppingIds", v)}
                    />

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

                    <div className="h-px bg-[#f5dce4]" />

                    {/* Cantidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                          Cantidad
                        </p>
                        <p className="text-[11px] text-[#b07a8a] mt-0.5">
                          Número de unidades con esta configuración
                        </p>
                      </div>
                      <QuantityStepper
                        value={cantidad}
                        onChange={setCantidad}
                      />
                    </div>

                    <div className="h-px bg-[#f5dce4]" />

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
                        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                          Precio a usar
                        </p>
                        <div className="flex gap-2">
                          {/* Sugerido */}
                          <button
                            type="button"
                            onClick={() => setUsarPrecioEstablecido(false)}
                            className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl border-2 transition ${
                              !usarPrecioEstablecido
                                ? "border-[#c0607a] bg-[#fdf6f0]"
                                : "border-[#e8c4cd] bg-white hover:bg-[#fdf9fb]"
                            }`}
                          >
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wide ${!usarPrecioEstablecido ? "text-[#c0607a]" : "text-[#b07a8a]"}`}
                            >
                              Precio sugerido
                            </span>
                            <span
                              className={`text-lg font-bold mt-0.5 ${!usarPrecioEstablecido ? "text-[#7b2d42]" : "text-[#b07a8a]"}`}
                            >
                              ${desglose.precioSugerido.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-[#c0a0a8] mt-0.5">
                              Calculado del desglose
                            </span>
                          </button>

                          {/* Establecido */}
                          <button
                            type="button"
                            onClick={() => setUsarPrecioEstablecido(true)}
                            className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl border-2 transition ${
                              usarPrecioEstablecido
                                ? "border-[#c0607a] bg-[#fdf6f0]"
                                : "border-[#e8c4cd] bg-white hover:bg-[#fdf9fb]"
                            }`}
                          >
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wide ${usarPrecioEstablecido ? "text-[#c0607a]" : "text-[#b07a8a]"}`}
                            >
                              Precio establecido
                            </span>
                            <span
                              className={`text-lg font-bold mt-0.5 ${usarPrecioEstablecido ? "text-[#7b2d42]" : "text-[#b07a8a]"}`}
                            >
                              ${producto.precioEstablecido!.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-[#c0a0a8] mt-0.5">
                              Definido manualmente
                            </span>
                          </button>
                        </div>

                        {/* Total con el precio elegido */}
                        {cantidad > 1 && (
                          <div className="flex justify-between items-center px-1 text-[13px]">
                            <span className="text-[#b07a8a]">
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
                        <span className="text-[#b07a8a]">
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
              <div className="flex gap-3 px-6 py-4 border-t border-[#f5dce4] bg-white shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!desglose || loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {added ? (
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
                      Agregado al carrito
                    </>
                  ) : (
                    <>
                      Agregar
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
