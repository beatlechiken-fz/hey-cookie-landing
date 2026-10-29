"use client";
// src/modules/admin/store/presentation/components/configurador/PersonalizadoConfiguradorModal.tsx
//
// "Armado personalizado": igual que Pastel/Gelatina, pero sin bizcocho ni
// gelatina de base — el admin elige insumos sueltos, coberturas, rellenos,
// toppings y empaques, y el total se calcula con la misma lógica compartida
// (ver usePersonalizadoConfigurador / CalcularCostoPersonalizado.usecase).

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePersonalizadoConfigurador } from "../../hooks/usePersonalizadoConfig";
import { useCartStore, type CartItem } from "../../hooks/useCartStore";
import { MultiSelectField } from "./MultiselectField";
import { MultiCoberturaField } from "./MultiCoberturaField";
import { MultiInsumoField } from "./MultiInsumoField";
import { QuantityStepper } from "./QuantityStepper";
import { CostoDesgloseTable } from "./CostoDesgloceTable";
import type { PersonalizadoConfiguracion } from "../../../domain/entities/Personalizado.entity";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Item del carrito a editar — si viene, precarga la config y guarda in-place en vez de agregar uno nuevo. */
  editItem?: CartItem | null;
  /**
   * Cuando se edita/agrega una partida de una orden YA GENERADA (no del
   * carrito), el guardado debe persistir en la orden en vez de tocar el
   * store del carrito — pásalo y se usa en su lugar.
   */
  onSave?: (payload: Omit<CartItem, "id" | "origen">) => Promise<void> | void;
}

export function PersonalizadoConfiguradorModal({ open, onClose, editItem, onSave }: Props) {
  const { catalogo, loading, error, config, setConfig, update, reset, desglose } =
    usePersonalizadoConfigurador();
  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const [added, setAdded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Al abrir en modo edición, precarga la configuración del item del carrito.
  useEffect(() => {
    if (open && editItem) {
      setConfig(editItem.configuracion as PersonalizadoConfiguracion);
    }
  }, [open, editItem, setConfig]);

  function handleClose() {
    reset();
    setAdded(false);
    setSaveError(null);
    onClose();
  }

  async function handleAddToCart() {
    if (!desglose) return;
    // Descarta filas sin elegir (insumo/cobertura/relleno agregados pero vacíos).
    const configLimpia: PersonalizadoConfiguracion = {
      ...config,
      insumos: config.insumos.filter((i) => i.ingredienteId),
      coberturas: config.coberturas.filter((c) => c.coberturaId),
      rellenos: config.rellenos.filter((r) => r.rellenoId),
    };
    const base = {
      nombre: "Armado personalizado",
      configuracion: configLimpia,
      cantidad: config.cantidad,
      costoUnitario: desglose.costoProduccionTotal,
      precioUnitario: desglose.precioSugerido,
      desgloseCostos: {
        costoInsumos: desglose.costoInsumos,
        cargosAdicionales: desglose.cargosAdicionales,
        costoProduccionTotal: desglose.costoProduccionTotal,
        precioSugerido: desglose.precioSugerido,
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

    const payload = { ...base, origen: "personalizado-configurador" as const };
    if (editItem) updateItem(editItem.id, payload);
    else addItem(payload);
    setAdded(true);
    setTimeout(() => handleClose(), 900);
  }

  return (
    <AnimatePresence>
      {open && (
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
            <div className="pointer-events-auto w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-hc-line bg-hc-hover shrink-0">
                <div>
                  <h2 className="font-bold text-hc-soft text-lg">
                    {editItem ? "Editar armado personalizado" : "Armado personalizado"}
                  </h2>
                  <p className="text-[12px] text-hc-muted">
                    {editItem
                      ? "Modifica el armado — se actualizará en el carrito"
                      : "Insumos, coberturas, rellenos, toppings y empaques a la medida — sin bizcocho ni gelatina"}
                  </p>
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
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {loading && (
                  <p className="text-center text-hc-soft text-sm py-8">
                    Cargando catálogo…
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {catalogo && (
                  <>
                    {/* Insumos sueltos — la línea base de este armado */}
                    <MultiInsumoField
                      label="Insumos"
                      items={config.insumos.map((i) => ({
                        id: i.ingredienteId,
                        cantidad: i.cantidad,
                      }))}
                      onChange={(items) =>
                        update(
                          "insumos",
                          items.map((it) => ({
                            ingredienteId: it.id,
                            cantidad: it.cantidad,
                          })),
                        )
                      }
                      options={catalogo.insumos
                        .map((i) => ({
                          value: i.id,
                          label: i.nombre,
                          sublabel:
                            i.costoUnidadMinima != null
                              ? `$${i.costoUnidadMinima}/${i.unidadBase}`
                              : undefined,
                          unidad: i.unidadBase,
                        }))
                        .sort((a, b) =>
                          a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
                        )}
                      addLabel="+ Agregar insumo"
                    />

                    <div className="h-px bg-hc-sunken" />

                    {/* Coberturas y rellenos */}
                    <div className="grid grid-cols-1 gap-4">
                      <MultiCoberturaField
                        label="Coberturas"
                        items={config.coberturas.map((c) => ({
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
                          sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                        addLabel="+ Agregar cobertura"
                      />

                      <MultiCoberturaField
                        label="Rellenos"
                        items={config.rellenos.map((r) => ({
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
                          sublabel: s.precio != null ? `+$${s.precio}` : undefined,
                        }))}
                        addLabel="+ Agregar relleno"
                      />
                    </div>

                    <div className="h-px bg-hc-sunken" />

                    {/* Toppings multi */}
                    <MultiSelectField
                      label="Toppings"
                      values={config.toppings.map((t) => t.ingredienteId)}
                      options={catalogo.toppings
                        .filter((t) => t.cantidad != null)
                        .map((t) => ({
                          value: t.ingredienteId,
                          label: t.nombre,
                          sublabel: `${t.cantidad}${t.unidad}`,
                        }))
                        .sort((a, b) =>
                          a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
                        )}
                      onChange={(ids) =>
                        update(
                          "toppings",
                          ids.map(
                            (id) =>
                              config.toppings.find((t) => t.ingredienteId === id) ?? {
                                ingredienteId: id,
                              },
                          ),
                        )
                      }
                    />
                    {/* Cantidad ajustable por topping — override manual solo para esta orden */}
                    {config.toppings.map((sel) => {
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
                                config.toppings.map((x) =>
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
                                  config.toppings.map((x) =>
                                    x.ingredienteId === sel.ingredienteId
                                      ? { ...x, cantidad: undefined }
                                      : x,
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

                    {/* Empaques multi */}
                    <MultiSelectField
                      label="Empaques"
                      values={config.empaqueIds}
                      options={catalogo.empaques.map((e) => ({
                        value: e.id,
                        label: e.nombre,
                        sublabel: `$${e.precio}`,
                      }))}
                      onChange={(v) => update("empaqueIds", v)}
                    />

                    <div className="h-px bg-hc-sunken" />

                    {/* Cantidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                          Cantidad
                        </p>
                        <p className="text-[11px] text-hc-muted mt-0.5">
                          Número de armados con esta configuración
                        </p>
                      </div>
                      <QuantityStepper
                        value={config.cantidad}
                        onChange={(v) => update("cantidad", v)}
                      />
                    </div>

                    <div className="h-px bg-hc-sunken" />

                    {/* Desglose de costos */}
                    {desglose && (
                      <CostoDesgloseTable desglose={desglose} cantidad={config.cantidad} />
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 px-6 py-4 border-t border-hc-line bg-white shrink-0">
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
                      editItem ? "Guardar cambios" : "Agregar al carrito"
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
