"use client";
// src/modules/admin/raws/presentation/components/OrnamentoModal.tsx

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Ornamento,
  CreateOrnamentoDTO,
} from "../../domain/entities/Ornamento.entity";

interface Props {
  open: boolean;
  ornamento?: Ornamento | null;
  onClose: () => void;
  onSave: (dto: CreateOrnamentoDTO) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

const EMPTY: CreateOrnamentoDTO = { nombre: "", precio: 0, imagenUrl: null };

export function OrnamentoModal({ open, ornamento, onClose, onSave, onUploadImage }: Props) {
  const isEdit = Boolean(ornamento);
  const [form, setForm] = useState<CreateOrnamentoDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(
        ornamento
          ? { nombre: ornamento.nombre, precio: ornamento.precio, imagenUrl: ornamento.imagenUrl }
          : EMPTY,
      );
      setError(null);
    }
  }, [open, ornamento]);

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
    if (!form.nombre.trim()) { setError("El nombre es requerido"); return; }
    if (form.precio < 0)     { setError("El precio no puede ser negativo"); return; }
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
    "w-full px-3 py-2 rounded-lg border border-[#e8c4a0] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#AA6A42]";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" />
          <motion.div key="modal" initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#f0e0d0] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e0d0] bg-[#FFF7F0]">
                <h2 className="font-bold text-[#AA6A42] text-lg">
                  {isEdit ? "Editar ornamento" : "Nuevo ornamento"}
                </h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0e0d0] transition text-[#6B3E26]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                {/* Imagen */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">Imagen</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border border-[#f0e0d0] bg-[#FFF7F0] overflow-hidden flex items-center justify-center shrink-0">
                      {form.imagenUrl ? (
                        <img src={form.imagenUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#e8c4a0]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange} className="hidden" id="ornamento-image-upload" />
                      <label htmlFor="ornamento-image-upload"
                        className={"cursor-pointer text-center py-2 px-3 rounded-lg border border-[#e8c4a0] text-[#AA6A42] text-[13px] font-semibold hover:bg-[#FFF7F0] transition " + (uploading ? "opacity-50 cursor-not-allowed" : "")}>
                        {uploading ? "Subiendo…" : form.imagenUrl ? "Cambiar imagen" : "Subir imagen"}
                      </label>
                      <p className="text-[11px] text-[#6B3E26]">JPG, PNG, WEBP o GIF · máx. 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">Nombre</label>
                  <input className={inputCls} value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Topper personalizado" autoFocus />
                </div>

                {/* Precio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">Precio (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B3E26] text-sm">$</span>
                    <input type="number" min="0" step="0.01" className={inputCls + " pl-7"}
                      value={form.precio || ""} placeholder="0.00"
                      onChange={(e) => setForm((f) => ({ ...f, precio: Number(e.target.value) }))} />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-[#e8c4a0] text-[#6B3E26] text-sm font-semibold hover:bg-[#FFF7F0] transition">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition">
                    {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear ornamento"}
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
