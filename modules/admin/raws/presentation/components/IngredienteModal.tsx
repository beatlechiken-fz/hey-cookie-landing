"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIAS } from "../../domain/entities/Ingrediente.entity";
import type {
  Ingrediente,
  CreateIngredienteDTO,
} from "../../domain/entities/Ingrediente.entity";

const UNIDADES = ["gr", "ml", "pieza", "piezas"];

interface Props {
  open: boolean;
  ingrediente?: Ingrediente | null;
  onClose: () => void;
  onSave: (dto: CreateIngredienteDTO) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

const EMPTY: CreateIngredienteDTO = {
  nombre: "",
  categoria: "otros",
  cantidadBase: null,
  unidadBase: "gr",
  costoBase: 0,
  topping: false, // ← añadido
  imagenUrl: null,
};

export function IngredienteModal({
  open,
  ingrediente,
  onClose,
  onSave,
  onUploadImage,
}: Props) {
  const isEdit = Boolean(ingrediente);
  const [form, setForm] = useState<CreateIngredienteDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              topping: ingrediente.topping, // ← añadido
              imagenUrl: ingrediente.imagenUrl ?? null,
            }
          : EMPTY,
      );
      setError(null);
    }
  }, [open, ingrediente]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await onUploadImage(file);
      setForm((f) => ({ ...f, imagenUrl: url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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

  function field(label: string, children: React.ReactNode) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
          {label}
        </label>
        {children}
      </div>
    );
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
              {/* Header */}
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
                {/* Imagen */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Imagen
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border border-[#f5dce4] bg-[#fdf6f0] overflow-hidden flex items-center justify-center shrink-0">
                      {form.imagenUrl ? (
                        <img
                          src={form.imagenUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-8 h-8 text-[#e8c4cd]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                        id="ingrediente-image-upload"
                      />
                      <label
                        htmlFor="ingrediente-image-upload"
                        className={
                          "cursor-pointer text-center py-2 px-3 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-[13px] font-semibold hover:bg-[#fdf6f0] transition " +
                          (uploading ? "opacity-50 cursor-not-allowed" : "")
                        }
                      >
                        {uploading
                          ? "Subiendo…"
                          : form.imagenUrl
                            ? "Cambiar imagen"
                            : "Subir imagen"}
                      </label>
                      <p className="text-[11px] text-[#b07a8a]">
                        JPG, PNG, WEBP o GIF · máx. 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {field(
                  "Nombre del ingrediente",
                  <input
                    className={inputCls}
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                    placeholder="Ej: Mantequilla sin sal"
                    autoFocus
                  />,
                )}

                {field(
                  "Categoría",
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
                  </select>,
                )}

                <div className="grid grid-cols-2 gap-4">
                  {field(
                    "Cantidad base",
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
                    />,
                  )}
                  {field(
                    "Unidad base",
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
                    </select>,
                  )}
                </div>

                {field(
                  "Costo base (MXN)",
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b07a8a] text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${inputCls} pl-7`}
                      value={form.costoBase || ""}
                      placeholder="0.00"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costoBase: Number(e.target.value),
                        }))
                      }
                    />
                  </div>,
                )}

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
                    disabled={saving || uploading}
                    className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 disabled:cursor-not-allowed transition"
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
