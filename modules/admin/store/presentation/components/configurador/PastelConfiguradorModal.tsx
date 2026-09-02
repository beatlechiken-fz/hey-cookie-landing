"use client";
// src/modules/admin/store/presentation/components/configurador/PastelConfiguradorModal.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePastelConfigurador } from "../../hooks/usePastelConfig";
import { useCartStore, type CartItem } from "../../hooks/useCartStore";
import { SelectField, NINGUNO } from "./SelectField";
import { MultiSelectField } from "./MultiselectField";
import { MultiCoberturaField } from "./MultiCoberturaField";
import { MultiSelectQuantityField } from "./MultiSelectQuantityField";
import { QuantityStepper } from "./QuantityStepper";
import { CostoDesgloseTable } from "./CostoDesgloceTable";
import { DiametroPersonasSelector } from "./DiametroPersonasSelector";
import {
  DIAMETRO_BASE_CM,
  type PastelConfiguracion,
} from "../../../domain/entities/PastelPersonalizado.entity";
import { personasDesdeDiametro } from "../../../domain/entities/PastelMedida.entity";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Item del carrito a editar — si viene, precarga la config y guarda in-place en vez de agregar uno nuevo. */
  editItem?: CartItem | null;
  /**
   * Cuando se edita una partida de una orden YA GENERADA (no del carrito),
   * el guardado debe persistir en la orden en vez de tocar el store del
   * carrito — pásalo junto con `editItem` y se usa en su lugar.
   */
  onSave?: (payload: Omit<CartItem, "id" | "origen">) => Promise<void> | void;
}

export function PastelConfiguradorModal({ open, onClose, editItem, onSave }: Props) {
  const { catalogo, loading, error, config, setConfig, update, reset, desglose } =
    usePastelConfigurador();
  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const [added, setAdded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4a0] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  // Al abrir en modo edición, precarga la configuración del item del carrito.
  useEffect(() => {
    if (open && editItem) {
      setConfig(editItem.configuracion as PastelConfiguracion);
    }
  }, [open, editItem, setConfig]);

  function handleClose() {
    reset();
    setAdded(false);
    onClose();
  }

  async function handleAddToCart() {
    if (!desglose) return;
    // Descarta filas de cobertura/relleno que se agregaron pero se dejaron sin elegir.
    const configLimpia = {
      ...config,
      coberturas: config.coberturas.filter((c) => c.coberturaId),
      rellenos: config.rellenos.filter((r) => r.rellenoId),
    };
    const base = {
      nombre: `Pastel personalizado (${personasDesdeDiametro(config.diametroCm)} personas)`,
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

    const payload = { ...base, origen: "pastel-configurador" as const };
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
            <div className="pointer-events-auto w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#f0e0d0] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e0d0] bg-[#FFF7F0] shrink-0">
                <div>
                  <h2 className="font-bold text-[#AA6A42] text-lg">
                    {editItem ? "Editar pastel personalizado" : "Pastel personalizado"}
                  </h2>
                  <p className="text-[12px] text-[#6B3E26]">
                    {editItem ? "Modifica tu pastel — se actualizará en el carrito" : "Configura tu pastel a la medida"}
                  </p>
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
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {loading && (
                  <p className="text-center text-[#AA6A42] text-sm py-8">
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
                    {/* Diámetro / Personas */}
                    <DiametroPersonasSelector
                      diametroCm={config.diametroCm}
                      medidaBaseCm={DIAMETRO_BASE_CM}
                      onChange={(d) => update("diametroCm", d)}
                    />

                    <div className="h-px bg-[#f0e0d0]" />

                    {/* Grid de selectores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField
                        label="Bizcocho"
                        value={config.bizcochoId ?? NINGUNO}
                        options={catalogo.bizcochos.map((b) => ({
                          value: b.id,
                          label: b.nombre,
                        }))}
                        onChange={(v) =>
                          update("bizcochoId", v === NINGUNO ? null : v)
                        }
                      />

                      <div className="sm:col-span-2">
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
                            sublabel:
                              s.precio != null ? `+$${s.precio}` : undefined,
                          }))}
                          addLabel="+ Agregar cobertura"
                        />
                      </div>

                      <div className="sm:col-span-2">
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
                            sublabel:
                              s.precio != null ? `+$${s.precio}` : undefined,
                          }))}
                          addLabel="+ Agregar relleno"
                        />
                      </div>

                      <SelectField
                        label="Jarabe"
                        value={config.jarabeId ?? NINGUNO}
                        options={catalogo.jarabes.map((j) => ({
                          value: j.id,
                          label: j.nombre,
                        }))}
                        onChange={(v) => {
                          update("jarabeId", v === NINGUNO ? null : v);
                          if (v === NINGUNO) {
                            update("saborJarabeId", null);
                            update("humedadJarabe", null);
                          }
                        }}
                      />

                      <SelectField
                        label="Sabor de jarabe"
                        value={config.saborJarabeId ?? NINGUNO}
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

                      {/* Toggle humedad — solo visible cuando hay jarabe seleccionado */}
                      {config.jarabeId && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider mb-1.5">
                            Humedad del pastel
                          </p>
                          <div className="flex rounded-lg border border-[#e8c4a0] overflow-hidden w-full">
                            <button
                              type="button"
                              onClick={() =>
                                update("humedadJarabe", "semi_humedo")
                              }
                              className={`flex-1 py-2 text-sm font-medium transition ${
                                (config.humedadJarabe ?? "semi_humedo") ===
                                "semi_humedo"
                                  ? "bg-[#c0607a] text-white"
                                  : "bg-white text-[#AA6A42] hover:bg-[#FFF7F0]"
                              }`}
                            >
                              Semi húmedo
                            </button>
                            <button
                              type="button"
                              onClick={() => update("humedadJarabe", "humedo")}
                              className={`flex-1 py-2 text-sm font-medium transition border-l border-[#e8c4a0] ${
                                config.humedadJarabe === "humedo"
                                  ? "bg-[#c0607a] text-white"
                                  : "bg-white text-[#AA6A42] hover:bg-[#FFF7F0]"
                              }`}
                            >
                              Húmedo{" "}
                              <span className="opacity-70 text-[11px]">
                                (×2.2 jarabe)
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      <SelectField
                        label="Licor"
                        value={config.licorId ?? NINGUNO}
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

                    {/* Toppings multi */}
                    <MultiSelectField
                      label="Toppings"
                      values={config.toppingIds}
                      options={catalogo.toppings
                        .filter((t) => t.cantidad != null)
                        .map((t) => ({
                          value: t.ingredienteId,
                          label: t.nombre,
                          sublabel: `${t.cantidad}${t.unidad}`,
                        }))
                        .sort((a, b) =>
                          a.label.localeCompare(b.label, "es", {
                            sensitivity: "base",
                          }),
                        )}
                      onChange={(v) => update("toppingIds", v)}
                    />

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

                    {/* Ornamentos multi, con cantidad por ornamento */}
                    {(catalogo.ornamentos?.length ?? 0) > 0 && (
                      <MultiSelectQuantityField
                        label="Ornamentos"
                        items={(config.ornamentos ?? []).map((o) => ({
                          id: o.ornamentoId,
                          cantidad: o.cantidad,
                        }))}
                        options={(catalogo.ornamentos ?? []).map((o) => ({
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
                    )}

                    <div className="h-px bg-[#f0e0d0]" />

                    {/* Cantidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                          Cantidad
                        </p>
                        <p className="text-[11px] text-[#6B3E26] mt-0.5">
                          Número de pasteles con esta configuración
                        </p>
                      </div>
                      <QuantityStepper
                        value={config.cantidad}
                        onChange={(v) => update("cantidad", v)}
                      />
                    </div>

                    <div className="h-px bg-[#f0e0d0]" />

                    {/* Desglose de costos */}
                    {desglose && (
                      <CostoDesgloseTable
                        desglose={desglose}
                        cantidad={config.cantidad}
                      />
                    )}
                  </>
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
