"use client";
// src/modules/admin/store/presentation/components/CuponModal.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Cupon,
  CreateCuponDTO,
  TipoDescuento,
  TipoCupon,
} from "../../domain/entities/Cupon.entity";

interface Props {
  open: boolean;
  cupon?: Cupon | null;
  onClose: () => void;
  onSave: (dto: CreateCuponDTO) => Promise<void>;
}

const EMPTY: CreateCuponDTO = {
  codigo: "",
  descripcion: "",
  tipo: "global",
  tipoDescuento: "porcentaje",
  valor: 0,
  usosMaximos: null,
  fechaInicio: null,
  fechaFin: null,
};

function toDateInput(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function CuponModal({ open, cupon, onClose, onSave }: Props) {
  const isEdit = Boolean(cupon);
  const [form, setForm] = useState<CreateCuponDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        cupon
          ? {
              codigo: cupon.codigo,
              descripcion: cupon.descripcion ?? "",
              tipo: cupon.tipo,
              tipoDescuento: cupon.tipoDescuento,
              valor: cupon.valor,
              usosMaximos: cupon.usosMaximos,
              fechaInicio: cupon.fechaInicio,
              fechaFin: cupon.fechaFin,
            }
          : EMPTY,
      );
      setError(null);
    }
  }, [open, cupon]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.codigo.trim()) {
      setError("El código es requerido");
      return;
    }
    if (form.valor <= 0) {
      setError("El valor debe ser mayor a 0");
      return;
    }
    if (form.tipoDescuento === "porcentaje" && form.valor > 100) {
      setError("El porcentaje no puede ser mayor a 100");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, codigo: form.codigo.trim().toUpperCase() });
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-sm focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition placeholder:text-hc-soft";

  return (
    <AnimatePresence>
      {open && (
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
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-hc-line bg-hc-hover">
                <h2 className="font-bold text-hc-soft text-lg">
                  {isEdit ? "Editar cupón" : "Nuevo cupón"}
                </h2>
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
                className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
              >
                {/* Código */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Código
                  </label>
                  <input
                    className={inputCls + " uppercase"}
                    value={form.codigo}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        codigo: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Ej: VERANO2026"
                    autoFocus
                  />
                </div>

                {/* Tipo de cupón */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Tipo de cupón
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: "global" as TipoCupon,
                        label: "Global",
                        desc: "Cualquier cliente puede usarlo",
                      },
                      {
                        value: "individual" as TipoCupon,
                        label: "Individual",
                        desc: "Se asigna a un cliente después",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, tipo: opt.value }))
                        }
                        className={
                          "text-left px-3 py-2.5 rounded-xl border transition " +
                          (form.tipo === opt.value
                            ? "border-hc-rose bg-hc-hover"
                            : "border-hc-line-strong hover:bg-hc-hover")
                        }
                      >
                        <p
                          className={
                            "text-sm font-semibold " +
                            (form.tipo === opt.value
                              ? "text-hc-rose"
                              : "text-hc-soft")
                          }
                        >
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-hc-muted mt-0.5">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                  {form.tipo === "individual" && (
                    <p className="text-[11px] text-hc-muted mt-1">
                      Este cupón podrá asignarse a un cliente específico desde
                      el módulo de clientes.
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Descripción{" "}
                    <span className="text-hc-soft normal-case font-normal">
                      (opcional)
                    </span>
                  </label>
                  <input
                    className={inputCls}
                    value={form.descripcion ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, descripcion: e.target.value }))
                    }
                    placeholder="Ej: Promoción de verano"
                  />
                </div>

                {/* Tipo + valor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                      Tipo de descuento
                    </label>
                    <select
                      className={inputCls}
                      value={form.tipoDescuento}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          tipoDescuento: e.target.value as TipoDescuento,
                        }))
                      }
                    >
                      <option value="porcentaje">Porcentaje (%)</option>
                      <option value="monto_fijo">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                      Valor
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hc-muted text-sm">
                        {form.tipoDescuento === "porcentaje" ? "%" : "$"}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={
                          form.tipoDescuento === "porcentaje" ? 100 : undefined
                        }
                        className={inputCls + " pl-7"}
                        value={form.valor || ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            valor: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Usos máximos */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Usos máximos{" "}
                    <span className="text-hc-soft normal-case font-normal">
                      (vacío = ilimitado)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={inputCls}
                    value={form.usosMaximos ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        usosMaximos: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    placeholder="Ilimitado"
                  />
                </div>

                {/* Vigencia */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                      Desde
                    </label>
                    <input
                      type="date"
                      className={inputCls}
                      value={toDateInput(form.fechaInicio)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          fechaInicio: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                      Hasta
                    </label>
                    <input
                      type="date"
                      className={inputCls}
                      value={toDateInput(form.fechaFin)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          fechaFin: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        }))
                      }
                    />
                  </div>
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
                    {saving
                      ? "Guardando…"
                      : isEdit
                        ? "Guardar cambios"
                        : "Crear cupón"}
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
