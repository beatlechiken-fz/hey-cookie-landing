"use client";
// src/modules/admin/store/presentation/components/BizcochoModal.tsx

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Bizcocho,
  CreateBizcochoDTO,
  CreateBizcochoIngredienteDTO,
} from "../../domain/entities/Bizcocho.entity";

interface Ingrediente {
  id: string;
  nombre: string;
  unidadBase: string;
  costoUnidadMinima: number | null;
}

interface LineItem extends CreateBizcochoIngredienteDTO {
  _nombre: string;
  _unidad: string;
  _costoUnidad: number;
}

interface Props {
  open: boolean;
  bizcocho?: Bizcocho | null;
  onClose: () => void;
  onSave: (dto: CreateBizcochoDTO) => Promise<void>;
}

export function BizcochoModal({ open, bizcocho, onClose, onSave }: Props) {
  const isEdit = Boolean(bizcocho);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [elaboracion, setElaboracion] = useState("");
  const [lineas, setLineas] = useState<LineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingSearch, setIngSearch] = useState("");
  const [ingResults, setIngResults] = useState<Ingrediente[]>([]);
  const [ingLoading, setIngLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const costoTotal = lineas.reduce(
    (s, l) => s + l.cantidad * l._costoUnidad,
    0,
  );

  useEffect(() => {
    if (!open) return;
    if (bizcocho) {
      setNombre(bizcocho.nombre);
      setDescripcion(bizcocho.descripcion ?? "");
      setElaboracion(bizcocho.elaboracion ?? "");
      setLineas(
        bizcocho.ingredientes.map((i) => ({
          ingredienteId: i.ingredienteId,
          cantidad: i.cantidad,
          _nombre: i.ingredienteNombre,
          _unidad: i.ingredienteUnidad,
          _costoUnidad:
            i.costoCalculado && i.cantidad ? i.costoCalculado / i.cantidad : 0,
        })),
      );
    } else {
      setNombre("");
      setDescripcion("");
      setElaboracion("");
      setLineas([]);
    }
    setError(null);
    setIngSearch("");
    setIngResults([]);
  }, [open, bizcocho]);

  // Debounced ingredient search
  useEffect(() => {
    if (ingSearch.length < 2) {
      setIngResults([]);
      setShowDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      setIngLoading(true);
      try {
        const res = await fetch(
          `/api/admin/ingredientes?search=${encodeURIComponent(ingSearch)}&pageSize=8`,
        );
        const data = await res.json();
        setIngResults(data.data ?? []);
        setShowDropdown(true);
      } finally {
        setIngLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [ingSearch]);

  const addIngrediente = useCallback((ing: Ingrediente) => {
    setLineas((prev) => {
      if (prev.some((l) => l.ingredienteId === ing.id)) return prev;
      return [
        ...prev,
        {
          ingredienteId: ing.id,
          cantidad: 0,
          _nombre: ing.nombre,
          _unidad: ing.unidadBase,
          _costoUnidad: ing.costoUnidadMinima ?? 0,
        },
      ];
    });
    setIngSearch("");
    setIngResults([]);
    setShowDropdown(false);
  }, []);

  const removeLinea = (id: string) =>
    setLineas((p) => p.filter((l) => l.ingredienteId !== id));
  const updateCantidad = (id: string, val: number) =>
    setLineas((p) =>
      p.map((l) => (l.ingredienteId === id ? { ...l, cantidad: val } : l)),
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        nombre,
        descripcion: descripcion || null,
        elaboracion: elaboracion || null,
        ingredientes: lineas
          .filter((l) => l.cantidad > 0)
          .map((l) => ({
            ingredienteId: l.ingredienteId,
            cantidad: l.cantidad,
          })),
      });
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
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#f5dce4] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <h2 className="font-bold text-[#7b2d42] text-lg">
                  {isEdit ? "Editar bizcocho" : "Nuevo bizcocho"}
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

              {/* Body scrollable */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
              >
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    className={inputCls}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Red Velvet"
                    autoFocus
                  />
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Descripción{" "}
                    <span className="text-[#c0a0a8] normal-case font-normal">
                      (visible para clientes)
                    </span>
                  </label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe las notas, textura y perfil de este bizcocho…"
                  />
                </div>

                {/* Elaboración */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Elaboración{" "}
                    <span className="text-[#c0a0a8] normal-case font-normal">
                      (procedimiento interno)
                    </span>
                  </label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={5}
                    value={elaboracion}
                    onChange={(e) => setElaboracion(e.target.value)}
                    placeholder="Describe paso a paso cómo elaborar este bizcocho…"
                  />
                </div>

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
                    Las cantidades están basadas en un{" "}
                    <strong>molde de 24 cm de diámetro × 7 cm de altura</strong>
                    .
                  </p>
                </div>

                {/* Ingredientes */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Ingredientes
                    </label>
                    <span className="text-[11px] text-[#b07a8a]">
                      {lineas.length} agregado{lineas.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Buscador */}
                  <div className="relative">
                    <input
                      className={inputCls + " pr-9"}
                      value={ingSearch}
                      onChange={(e) => setIngSearch(e.target.value)}
                      placeholder="Buscar y agregar ingrediente…"
                    />
                    {ingLoading ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#c0607a] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0a0a8] pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                    )}
                    {showDropdown && ingResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#f5dce4] rounded-xl shadow-lg z-10 overflow-hidden">
                        {ingResults.map((ing) => (
                          <button
                            key={ing.id}
                            type="button"
                            onClick={() => addIngrediente(ing)}
                            disabled={lineas.some(
                              (l) => l.ingredienteId === ing.id,
                            )}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition border-b border-[#f9eef2] last:border-0"
                          >
                            <span className="text-[#3d1a24] font-medium">
                              {ing.nombre}
                            </span>
                            <span className="text-[11px] text-[#b07a8a]">
                              ${ing.costoUnidadMinima?.toFixed(4)} /{" "}
                              {ing.unidadBase}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tabla */}
                  {lineas.length > 0 && (
                    <div className="rounded-xl border border-[#f5dce4] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#fdf6f0] border-b border-[#f5dce4]">
                            <th className="px-3 py-2 text-left   text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                              Ingrediente
                            </th>
                            <th className="px-3 py-2 text-center text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-3 py-2 text-right  text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                              Costo
                            </th>
                            <th className="px-3 py-2 w-8" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f9eef2]">
                          {lineas.map((l) => (
                            <tr key={l.ingredienteId}>
                              <td className="px-3 py-2">
                                <p className="font-medium text-[#3d1a24] text-[13px]">
                                  {l._nombre}
                                </p>
                                <p className="text-[11px] text-[#b07a8a]">
                                  ${l._costoUnidad.toFixed(4)}/{l._unidad}
                                </p>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1 justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={l.cantidad || ""}
                                    onChange={(e) =>
                                      updateCantidad(
                                        l.ingredienteId,
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-20 text-center px-2 py-1 rounded-lg border border-[#e8c4cd] text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] transition"
                                  />
                                  <span className="text-[11px] text-[#b07a8a]">
                                    {l._unidad}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-[#7b2d42] text-[13px]">
                                ${(l.cantidad * l._costoUnidad).toFixed(2)}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => removeLinea(l.ingredienteId)}
                                  className="p-1 rounded-lg hover:bg-red-50 text-[#c0a0a8] hover:text-red-500 transition"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#fdf6f0] border-t border-[#f5dce4]">
                            <td
                              colSpan={2}
                              className="px-3 py-2 text-right text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider"
                            >
                              Total
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-[#c0607a] text-base">
                              ${costoTotal.toFixed(2)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </form>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#f5dce4] bg-white shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit as any}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                >
                  {saving
                    ? "Guardando…"
                    : isEdit
                      ? "Guardar cambios"
                      : "Crear bizcocho"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
