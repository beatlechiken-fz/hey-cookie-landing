"use client";
// src/modules/admin/store/presentation/components/configurador/PastelConfiguradorModal.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePastelConfigurador } from "../../hooks/usePastelConfig";
import { useCartStore } from "../../hooks/useCartStore";
import { SelectField, NINGUNO } from "./SelectField";
import { MultiSelectField } from "./MultiselectField";
import { QuantityStepper } from "./QuantityStepper";
import { CostoDesgloseTable } from "./CostoDesgloceTable";
import { DiametroPersonasSelector } from "./DiametroPersonasSelector";
import { DIAMETRO_BASE_CM } from "../../../domain/entities/PastelPersonalizado.entity";
import { personasDesdeDiametro } from "../../../domain/entities/PastelMedida.entity";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PastelConfiguradorModal({ open, onClose }: Props) {
  const { catalogo, loading, error, config, update, reset, desglose } =
    usePastelConfigurador();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  function handleClose() {
    reset();
    setAdded(false);
    onClose();
  }

  function handleAddToCart() {
    if (!desglose) return;
    addItem({
      nombre: `Pastel personalizado (${personasDesdeDiametro(config.diametroCm)} personas)`,
      configuracion: { ...config },
      cantidad: config.cantidad,
      costoUnitario: desglose.costoProduccionTotal,
      precioUnitario: desglose.precioSugerido,
      desgloseCostos: {
        costoInsumos: desglose.costoInsumos,
        cargosAdicionales: desglose.cargosAdicionales,
        costoProduccionTotal: desglose.costoProduccionTotal,
        precioSugerido: desglose.precioSugerido,
      },
    });
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
            <div className="pointer-events-auto w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#f5dce4] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <div>
                  <h2 className="font-bold text-[#7b2d42] text-lg">
                    Pastel personalizado
                  </h2>
                  <p className="text-[12px] text-[#b07a8a]">
                    Configura tu pastel a la medida
                  </p>
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
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {loading && (
                  <p className="text-center text-[#c0a0a8] text-sm py-8">
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

                    <div className="h-px bg-[#f5dce4]" />

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

                      <SelectField
                        label="Cobertura"
                        value={config.coberturaId ?? NINGUNO}
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
                        value={config.saborCoberturaId ?? NINGUNO}
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
                        value={config.rellenoId ?? NINGUNO}
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
                        value={config.saborRellenoId ?? NINGUNO}
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
                        value={config.jarabeId ?? NINGUNO}
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

                    <div className="h-px bg-[#f5dce4]" />

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

                    <div className="h-px bg-[#f5dce4]" />

                    {/* Cantidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                          Cantidad
                        </p>
                        <p className="text-[11px] text-[#b07a8a] mt-0.5">
                          Número de pasteles con esta configuración
                        </p>
                      </div>
                      <QuantityStepper
                        value={config.cantidad}
                        onChange={(v) => update("cantidad", v)}
                      />
                    </div>

                    <div className="h-px bg-[#f5dce4]" />

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
                    "Agregar al carrito"
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
