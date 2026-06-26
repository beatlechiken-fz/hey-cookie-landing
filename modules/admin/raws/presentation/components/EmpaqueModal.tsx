"use client";
// src/modules/admin/store/presentation/components/EmpaqueModal.tsx

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Empaque,
  CreateEmpaqueDTO,
} from "../../domain/entities/Empaque.entity";

interface Props {
  open: boolean;
  empaque?: Empaque | null;
  onClose: () => void;
  onSave: (dto: CreateEmpaqueDTO) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

const EMPTY: CreateEmpaqueDTO = { nombre: "", precio: 0, imagenUrl: null };

export function EmpaqueModal({
  open,
  empaque,
  onClose,
  onSave,
  onUploadImage,
}: Props) {
  const isEdit = Boolean(empaque);
  const [form, setForm] = useState<CreateEmpaqueDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(
        empaque
          ? {
              nombre: empaque.nombre,
              precio: empaque.precio,
              imagenUrl: empaque.imagenUrl,
            }
          : EMPTY,
      );
      setError(null);
    }
  }, [open, empaque]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (form.precio < 0) {
      setError("El precio no puede ser negativo");
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
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#f5dce4] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0]">
                <h2 className="font-bold text-[#7b2d42] text-lg">
                  {isEdit ? "Editar empaque" : "Nuevo empaque"}
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
                        id="empaque-image-upload"
                      />
                      <label
                        htmlFor="empaque-image-upload"
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

                {/* Nombre */}
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
                    placeholder="Ej: Domo #24"
                    autoFocus
                  />
                </div>

                {/* Precio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Precio (MXN)
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
                      value={form.precio || ""}
                      placeholder="0.00"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          precio: Number(e.target.value),
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
                    className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                  >
                    {saving
                      ? "Guardando…"
                      : isEdit
                        ? "Guardar cambios"
                        : "Crear empaque"}
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
