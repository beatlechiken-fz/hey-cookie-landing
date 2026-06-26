"use client";
// src/modules/admin/clientes/presentation/components/ClienteModal.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Cliente,
  CreateClienteDTO,
} from "../../domain/entities/Cliente.entity";

interface Props {
  open: boolean;
  cliente?: Cliente | null;
  onClose: () => void;
  onSave: (dto: CreateClienteDTO) => Promise<void>;
}

const EMPTY: CreateClienteDTO = {
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
  notas: "",
};

export function ClienteModal({ open, cliente, onClose, onSave }: Props) {
  const isEdit = Boolean(cliente);
  const [form, setForm] = useState<CreateClienteDTO>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        cliente
          ? {
              nombre: cliente.nombre,
              telefono: cliente.telefono ?? "",
              email: cliente.email ?? "",
              direccion: cliente.direccion ?? "",
              notas: cliente.notas ?? "",
            }
          : EMPTY,
      );
      setError(null);
    }
  }, [open, cliente]);

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
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#f5dce4] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0]">
                <h2 className="font-bold text-[#7b2d42] text-lg">
                  {isEdit ? "Editar cliente" : "Nuevo cliente"}
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
                className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
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
                    placeholder="Ej: María Pérez"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      className={inputCls}
                      value={form.telefono ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, telefono: e.target.value }))
                      }
                      placeholder="Ej: 443 123 4567"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Dirección
                  </label>
                  <input
                    className={inputCls}
                    value={form.direccion ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, direccion: e.target.value }))
                    }
                    placeholder="Calle, número, colonia, ciudad"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Notas{" "}
                    <span className="text-[#c0a0a8] normal-case font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    value={form.notas ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notas: e.target.value }))
                    }
                    placeholder="Preferencias, alergias, observaciones…"
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
                        : "Crear cliente"}
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
