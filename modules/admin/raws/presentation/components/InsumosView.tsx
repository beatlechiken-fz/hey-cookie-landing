"use client";
// src/modules/admin/store/presentation/components/InsumosView.tsx
// Vista principal con pestañas: Insumos | Toppings

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredientes } from "../hooks/useIngredientes";
import { ToppingsTab } from "./ToppingsTab";
import { LicoresTab } from "./LicoresTab";
import { CATEGORIAS } from "../../domain/entities/Ingrediente.entity";
import type {
  Ingrediente,
  CreateIngredienteDTO,
  CategoriaIngrediente,
} from "../../domain/entities/Ingrediente.entity";

const UNIDADES = ["gr", "ml", "pieza", "piezas"];

function fmt(n: number | null, decimals = 2) {
  if (n === null || n === undefined) return "—";
  return "$" + n.toFixed(decimals);
}

function UnidadBadge({ unidad }: { unidad: string }) {
  const colors: Record<string, string> = {
    gr: "bg-amber-50 text-amber-700 border-amber-200",
    ml: "bg-blue-50  text-blue-700  border-blue-200",
    pieza: "bg-purple-50 text-purple-700 border-purple-200",
    piezas: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={
        "px-2 py-0.5 rounded-full text-[11px] font-semibold border " +
        (colors[unidad] ?? "bg-gray-50 text-gray-600 border-gray-200")
      }
    >
      {unidad}
    </span>
  );
}

const CAT_COLORS: Record<string, string> = {
  lacteos: "bg-sky-50 text-sky-700 border-sky-200",
  harinas_cereales: "bg-yellow-50 text-yellow-700 border-yellow-200",
  endulzantes: "bg-pink-50 text-pink-700 border-pink-200",
  chocolates: "bg-amber-50 text-amber-800 border-amber-300",
  frutas: "bg-green-50 text-green-700 border-green-200",
  frutos_secos: "bg-orange-50 text-orange-700 border-orange-200",
  especias_aromas: "bg-violet-50 text-violet-700 border-violet-200",
  mermeladas_confituras: "bg-rose-50 text-rose-700 border-rose-200",
  grasas_aceites: "bg-lime-50 text-lime-700 border-lime-200",
  licores_bebidas: "bg-indigo-50 text-indigo-700 border-indigo-200",
  aditivos_quimicos: "bg-gray-100 text-gray-700 border-gray-300",
  galletas_bases: "bg-teal-50 text-teal-700 border-teal-200",
  empaques: "bg-slate-50 text-slate-600 border-slate-200",
  otros: "bg-gray-50 text-gray-500 border-gray-200",
};

function CategoriaBadge({ categoria }: { categoria: string }) {
  const label =
    CATEGORIAS.find((c) => c.value === categoria)?.label ?? categoria;
  return (
    <span
      className={
        "px-2 py-0.5 rounded-full text-[11px] font-medium border " +
        (CAT_COLORS[categoria] ?? CAT_COLORS.otros)
      }
    >
      {label}
    </span>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-[#c0607a]/10 text-[#c0607a] text-[12px] font-semibold border border-[#c0607a]/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-[#c0607a]/20 rounded-full p-0.5 transition"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function SlidersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="17" y2="6" />
      <circle cx="7" cy="6" r="2" fill="currentColor" stroke="none" />
      <line x1="3" y1="14" x2="17" y2="14" />
      <circle cx="13" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "relative px-5 py-2.5 text-sm font-semibold transition " +
        (active ? "text-[#c0607a]" : "text-[#b07a8a] hover:text-[#7b2d42]")
      }
    >
      {label}
      {active && (
        <motion.div
          layoutId="insumos-tab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c0607a] rounded-full"
        />
      )}
    </button>
  );
}

// ── Ingrediente Modal ─────────────────────────────────────────────────────────

function IngredienteModal({
  open,
  ingrediente,
  onClose,
  onSave,
}: {
  open: boolean;
  ingrediente?: Ingrediente | null;
  onClose: () => void;
  onSave: (dto: CreateIngredienteDTO) => Promise<void>;
}) {
  const isEdit = Boolean(ingrediente);
  const [form, setForm] = useState<CreateIngredienteDTO>({
    nombre: "",
    categoria: "otros",
    cantidadBase: null,
    unidadBase: "gr",
    costoBase: 0,
    topping: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        ingrediente
          ? {
              nombre: ingrediente.nombre,
              categoria: ingrediente.categoria,
              cantidadBase: ingrediente.cantidadBase,
              unidadBase: ingrediente.unidadBase,
              costoBase: ingrediente.costoBase,
              topping: ingrediente.topping,
            }
          : {
              nombre: "",
              categoria: "otros",
              cantidadBase: null,
              unidadBase: "gr",
              costoBase: 0,
              topping: false,
            },
      );
      setError(null);
    }
  }, [open, ingrediente]);

  const isWV = form.unidadBase === "gr" || form.unidadBase === "ml";
  const costoKgL =
    isWV && form.cantidadBase && form.cantidadBase > 0
      ? ((form.costoBase / form.cantidadBase) * 1000).toFixed(2)
      : null;
  const costoUnidad =
    form.cantidadBase && form.cantidadBase > 0
      ? (form.costoBase / form.cantidadBase).toFixed(4)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#c0a0a8]";

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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#f5dce4] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0]">
                <h2 className="font-bold text-[#7b2d42] text-lg">
                  {isEdit ? "Editar ingrediente" : "Nuevo ingrediente"}
                </h2>
                <button
                  onClick={onClose}
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
              <form
                onSubmit={handleSubmit}
                className="px-6 py-5 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    className={inputCls}
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                    placeholder="Ej: Mantequilla sin sal"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    className={inputCls}
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        categoria: e.target.value as any,
                      }))
                    }
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Cantidad base
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={form.cantidadBase ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cantidadBase: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                      placeholder="Ej: 1000"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Unidad base
                    </label>
                    <select
                      className={inputCls}
                      value={form.unidadBase}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          unidadBase: e.target.value as any,
                        }))
                      }
                    >
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Costo base (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b07a8a] text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputCls + " pl-7"}
                      value={form.costoBase || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costoBase: Number(e.target.value),
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Toggle topping */}
                <label className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#f5dce4] bg-[#fdf6f0] cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-[#7b2d42]">
                      Es topping
                    </p>
                    <p className="text-[11px] text-[#b07a8a]">
                      Aparecerá en el listado de toppings
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.topping}
                    onClick={() =>
                      setForm((f) => ({ ...f, topping: !f.topping }))
                    }
                    className={
                      "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors " +
                      (form.topping ? "bg-[#c0607a]" : "bg-gray-200")
                    }
                  >
                    <span
                      className={
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform " +
                        (form.topping ? "translate-x-5" : "translate-x-0")
                      }
                    />
                  </button>
                </label>

                {(costoKgL || costoUnidad) && (
                  <div className="rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-4 py-3 flex gap-6">
                    {costoKgL && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                          Costo / {form.unidadBase === "gr" ? "Kg" : "L"}
                        </p>
                        <p className="text-[15px] font-bold text-[#7b2d42]">
                          ${costoKgL}
                        </p>
                      </div>
                    )}
                    {costoUnidad && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                          Costo /{" "}
                          {form.unidadBase === "piezas"
                            ? "pieza"
                            : form.unidadBase}
                        </p>
                        <p className="text-[15px] font-bold text-[#7b2d42]">
                          ${costoUnidad}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                  >
                    {saving
                      ? "Guardando…"
                      : isEdit
                        ? "Guardar cambios"
                        : "Crear ingrediente"}
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

// ── Filter Drawer ─────────────────────────────────────────────────────────────

function FilterDrawer({
  open,
  onClose,
  categoria,
  unidadBase,
  onCategoriaChange,
  onUnidadBaseChange,
}: {
  open: boolean;
  onClose: () => void;
  categoria: CategoriaIngrediente | "";
  unidadBase: string;
  onCategoriaChange: (v: CategoriaIngrediente | "") => void;
  onUnidadBaseChange: (v: string) => void;
}) {
  const [draftCat, setDraftCat] = useState<CategoriaIngrediente | "">(
    categoria,
  );
  const [draftUnidad, setDraftUnidad] = useState(unidadBase);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraftCat(categoria);
      setDraftUnidad(unidadBase);
    }
  }, [open, categoria, unidadBase]);

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    const t = setTimeout(() => document.addEventListener("mousedown", h), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", h);
    };
  }, [open, onClose]);

  const hasChanges = draftCat !== "" || draftUnidad !== "";

  const checkIcon = (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 text-[#c0607a] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
          />
          <motion.div
            key="drawer"
            ref={ref}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed left-0 top-0 h-full w-[320px] z-50 flex flex-col bg-white"
            style={{
              borderRight: "1px solid #f5dce4",
              boxShadow: "4px 0 32px rgba(123,45,66,0.10)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f5dce4] bg-[#fdf6f0]">
              <div className="flex items-center gap-2.5">
                <SlidersIcon className="w-4 h-4 text-[#c0607a]" />
                <h2 className="font-bold text-[#7b2d42] text-base">Filtros</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">
              <div>
                <p className="text-[11px] font-semibold text-[#b07a8a] uppercase tracking-widest mb-3">
                  Categoría
                </p>
                <div className="flex flex-col gap-0.5">
                  {[
                    { value: "" as const, label: "Todas las categorías" },
                    ...CATEGORIAS,
                  ].map((c) => {
                    const active = draftCat === c.value;
                    return (
                      <button
                        key={String(c.value)}
                        onClick={() => setDraftCat(c.value as any)}
                        className={
                          "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition border " +
                          (active
                            ? "bg-[#fdf6f0] border-[#e8c4cd] text-[#7b2d42] font-semibold"
                            : "bg-transparent border-transparent text-[#7b2d42]/70 hover:bg-[#fdf6f0] hover:border-[#f5dce4]")
                        }
                      >
                        {c.label}
                        {active && checkIcon}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="h-px bg-[#f5dce4]" />
              <div>
                <p className="text-[11px] font-semibold text-[#b07a8a] uppercase tracking-widest mb-3">
                  Unidad base
                </p>
                <div className="flex flex-col gap-0.5">
                  {[
                    { value: "", label: "Todas las unidades" },
                    ...UNIDADES.map((u) => ({ value: u, label: u })),
                  ].map((u) => {
                    const active = draftUnidad === u.value;
                    return (
                      <button
                        key={u.value}
                        onClick={() => setDraftUnidad(u.value)}
                        className={
                          "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition border " +
                          (active
                            ? "bg-[#fdf6f0] border-[#e8c4cd] text-[#7b2d42] font-semibold"
                            : "bg-transparent border-transparent text-[#7b2d42]/70 hover:bg-[#fdf6f0] hover:border-[#f5dce4]")
                        }
                      >
                        {u.label}
                        {active && checkIcon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#f5dce4] bg-[#fdf6f0] flex flex-col gap-2">
              {hasChanges && (
                <button
                  onClick={() => {
                    setDraftCat("");
                    setDraftUnidad("");
                  }}
                  className="w-full py-2 rounded-xl text-[13px] font-semibold text-[#b07a8a] hover:bg-[#f5dce4] transition"
                >
                  Limpiar filtros
                </button>
              )}
              <button
                onClick={() => {
                  onCategoriaChange(draftCat);
                  onUnidadBaseChange(draftUnidad);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#c0607a] text-white text-[14px] font-bold hover:bg-[#a84d66] transition"
              >
                Ver resultados
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Delete Dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({
  open,
  nombre,
  onClose,
  onConfirm,
}: {
  open: boolean;
  nombre: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#f5dce4] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#3d1a24] text-base">
                    Eliminar ingrediente
                  </h3>
                  <p className="text-sm text-[#b07a8a]">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#7b2d42]">
                ¿Confirmas que deseas eliminar <strong>"{nombre}"</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Insumos Tab ───────────────────────────────────────────────────────────────

function InsumosTab() {
  const {
    ingredientes,
    total,
    totalPages,
    page,
    search,
    unidadBase,
    categoria,
    isLoading,
    error,
    setSearch,
    setUnidadBase,
    setCategoria,
    setPage,
    create,
    update,
    remove,
    toggleTopping,
  } = useIngredientes();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ingrediente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ingrediente | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const hasFilters = Boolean(unidadBase || categoria);
  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (i: Ingrediente) => {
    setEditTarget(i);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (dto: CreateIngredienteDTO) => {
      if (editTarget) await update(editTarget.id, dto);
      else await create(dto);
    },
    [editTarget, create, update],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e: any) {
      setActionError(e.message);
    }
  }, [deleteTarget, remove]);

  const handleToggleTopping = async (ing: Ingrediente) => {
    setTogglingId(ing.id);
    try {
      await toggleTopping(ing.id, !ing.topping);
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className={
              "relative flex items-center justify-center w-10 h-10 rounded-xl border transition shrink-0 " +
              (hasFilters
                ? "bg-[#c0607a] text-white border-[#c0607a]"
                : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]")
            }
          >
            <SlidersIcon className="w-4 h-4" />
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#c0607a]" />
            )}
          </button>
          <div className="relative flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ingrediente…"
              className="w-full pl-4 pr-28 py-2.5 rounded-xl border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 placeholder:text-[#c0a0a8]"
            />
            <div className="absolute right-[7.5rem] top-1/2 -translate-y-1/2 text-[#c0a0a8] pointer-events-none">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <button
              onClick={openCreate}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c0607a] text-white text-[13px] font-bold hover:bg-[#a84d66] transition"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Crear
            </button>
          </div>
        </div>
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {categoria && (
              <ActiveFilterChip
                label={
                  CATEGORIAS.find((c) => c.value === categoria)?.label ??
                  categoria
                }
                onRemove={() => setCategoria("")}
              />
            )}
            {unidadBase && (
              <ActiveFilterChip
                label={unidadBase}
                onRemove={() => setUnidadBase("")}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#b07a8a]">
          {isLoading
            ? "Cargando…"
            : `${total} ingrediente${total !== 1 ? "s" : ""}`}
        </p>
        {(error || actionError) && (
          <p className="text-sm text-red-600">{error ?? actionError}</p>
        )}
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block rounded-2xl border border-[#f5dce4] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#fdf6f0] border-b border-[#f5dce4]">
              {[
                "Ingrediente",
                "Categoría",
                "Cant. base",
                "Unidad",
                "Costo base",
                "Costo Kg/L",
                "Costo unit.",
                "Topping",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className={
                    "px-4 py-3 text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider " +
                    (i === 0 || i === 1
                      ? "text-left"
                      : i === 3 || i === 7
                        ? "text-center"
                        : i === 8
                          ? ""
                          : "text-right")
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f9eef2]">
            {isLoading && (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-[#c0a0a8] text-sm"
                >
                  Cargando…
                </td>
              </tr>
            )}
            {!isLoading && ingredientes.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-[#c0a0a8] text-sm"
                >
                  No se encontraron ingredientes
                </td>
              </tr>
            )}
            {ingredientes.map((ing) => (
              <tr
                key={ing.id}
                className="hover:bg-[#fdf6f0]/60 transition group"
              >
                <td className="px-4 py-3 font-medium text-[#3d1a24]">
                  {ing.nombre}
                </td>
                <td className="px-4 py-3">
                  <CategoriaBadge categoria={ing.categoria} />
                </td>
                <td className="px-4 py-3 text-right text-[#7b2d42]">
                  {ing.cantidadBase ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <UnidadBadge unidad={ing.unidadBase} />
                </td>
                <td className="px-4 py-3 text-right text-[#7b2d42] font-medium">
                  {fmt(ing.costoBase)}
                </td>
                <td className="px-4 py-3 text-right text-[#b07a8a]">
                  {fmt(ing.costoKgL)}
                </td>
                <td className="px-4 py-3 text-right text-[#b07a8a]">
                  {fmt(ing.costoUnidadMinima, 4)}
                </td>
                {/* Toggle topping */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleTopping(ing)}
                    disabled={togglingId === ing.id}
                    className={
                      "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors disabled:opacity-50 " +
                      (ing.topping ? "bg-[#c0607a]" : "bg-gray-200")
                    }
                    title={
                      ing.topping ? "Quitar de toppings" : "Marcar como topping"
                    }
                  >
                    <span
                      className={
                        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform " +
                        (ing.topping ? "translate-x-4" : "translate-x-0")
                      }
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(ing)}
                      className="p-1.5 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-[#c0607a] transition"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ing)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-600 transition"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="flex md:hidden flex-col gap-3">
        {ingredientes.map((ing) => (
          <div
            key={ing.id}
            className="bg-white rounded-2xl border border-[#f5dce4] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold text-[#3d1a24]">{ing.nombre}</p>
                <div className="flex gap-1.5 flex-wrap">
                  <CategoriaBadge categoria={ing.categoria} />
                  <UnidadBadge unidad={ing.unidadBase} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleTopping(ing)}
                  disabled={togglingId === ing.id}
                  className={
                    "relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors disabled:opacity-50 " +
                    (ing.topping ? "bg-[#c0607a]" : "bg-gray-200")
                  }
                >
                  <span
                    className={
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform " +
                      (ing.topping ? "translate-x-4" : "translate-x-0")
                    }
                  />
                </button>
                <button
                  onClick={() => openEdit(ing)}
                  className="p-2 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(ing)}
                  className="p-2 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-600 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["Cantidad", ing.cantidadBase ?? "—"],
                  ["Costo base", fmt(ing.costoBase)],
                  ["Costo unit.", fmt(ing.costoUnidadMinima, 4)],
                ] as [string, string][]
              ).map(([label, val]) => (
                <div key={label} className="bg-[#fdf6f0] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-[#7b2d42]">{val}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-[#b07a8a]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Siguiente →
          </button>
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categoria={categoria}
        unidadBase={unidadBase}
        onCategoriaChange={setCategoria}
        onUnidadBaseChange={setUnidadBase}
      />
      <IngredienteModal
        open={modalOpen}
        ingrediente={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      <DeleteDialog
        open={Boolean(deleteTarget)}
        nombre={deleteTarget?.nombre ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function InsumosView() {
  const [activeTab, setActiveTab] = useState<
    "insumos" | "toppings" | "licores"
  >("insumos");

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex border-b border-[#f5dce4]">
        <Tab
          label="Insumos"
          active={activeTab === "insumos"}
          onClick={() => setActiveTab("insumos")}
        />
        <Tab
          label="Toppings"
          active={activeTab === "toppings"}
          onClick={() => setActiveTab("toppings")}
        />
        <Tab
          label="Licores"
          active={activeTab === "licores"}
          onClick={() => setActiveTab("licores")}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "insumos" ? (
            <InsumosTab />
          ) : activeTab === "toppings" ? (
            <ToppingsTab />
          ) : (
            <LicoresTab />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
