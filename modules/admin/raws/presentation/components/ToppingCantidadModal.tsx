"use client";
// src/modules/admin/store/presentation/components/ToppingCantidadModal.tsx
// Modal para definir la cantidad de un topping para un pastel de 24cm

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToppingItem } from "../hooks/useIngredientes";
import type { UpsertToppingCantidadDTO } from "../../domain/entities/Ingrediente.entity";

interface Props {
  open: boolean;
  item: ToppingItem | null;
  onClose: () => void;
  onSave: (dto: UpsertToppingCantidadDTO) => Promise<void>;
}

export function ToppingCantidadModal({ open, item, onClose, onSave }: Props) {
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unidad = item?.ingrediente.unidadBase ?? "";

  useEffect(() => {
    if (!open || !item) return;
    setCantidad(
      item.cantidad?.cantidad != null ? String(item.cantidad.cantidad) : "",
    );
    setNotas(item.cantidad?.notas ?? "");
    setError(null);
  }, [open, item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ingredienteId: item.ingrediente.id,
        cantidad: cantidad ? Number(cantidad) : null,
        unidad: unidad || null,
        notas: notas || null,
      });
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-sm focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition placeholder:text-hc-soft";

  // Preview del costo
  const costoTotal =
    cantidad && item?.ingrediente.costoUnidadMinima
      ? (Number(cantidad) * item.ingrediente.costoUnidadMinima).toFixed(2)
      : null;

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-hc-cacao/25 backdrop-blur-[2px] z-40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-hc-line bg-hc-hover">
                <div>
                  <h2 className="font-bold text-hc-soft text-base">
                    Cantidad de topping
                  </h2>
                  <p className="text-[12px] text-hc-muted mt-0.5">
                    {item.ingrediente.nombre}
                  </p>
                </div>
                <button
                  onClick={onClose}
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

              <form
                onSubmit={handleSubmit}
                className="px-6 py-5 flex flex-col gap-4"
              >
                {/* Nota molde */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    Cantidad para un <strong>pastel de 24 cm</strong> de
                    diámetro.
                  </p>
                </div>

                {/* Cantidad */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Cantidad ({unidad})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputCls}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 150"
                    autoFocus
                  />
                </div>

                {/* Preview costo */}
                {costoTotal && (
                  <div className="rounded-xl bg-hc-hover border border-hc-line px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[12px] text-hc-muted">
                      Costo estimado
                    </span>
                    <span className="font-bold text-hc-rose">
                      ${costoTotal}
                    </span>
                  </div>
                )}

                {/* Notas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Notas{" "}
                    <span className="text-hc-soft normal-case font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: picado fino, en rebanadas…"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-hc-line-strong text-hc-muted text-sm font-semibold hover:bg-hc-hover transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-hc-rose text-white text-sm font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
