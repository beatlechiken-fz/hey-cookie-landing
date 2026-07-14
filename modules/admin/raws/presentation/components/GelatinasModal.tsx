"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Gelatina,
  CreateGelatinaDTO,
  CreateGelatinaIngredienteDTO,
} from "../../domain/entities/Gelatina.entity";

interface Ingrediente {
  id: string;
  nombre: string;
  unidadBase: string;
  costoUnidadMinima: number | null;
}

interface LineItem extends CreateGelatinaIngredienteDTO {
  _nombre: string;
  _unidad: string;
  _costo: number;
}

interface Props {
  open: boolean;
  gelatina?: Gelatina | null;
  onClose: () => void;
  onSave: (dto: CreateGelatinaDTO) => Promise<void>;
}

export function GelatinasModal({ open, gelatina, onClose, onSave }: Props) {
  const isEdit = Boolean(gelatina);
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [lineas, setLineas] = useState<LineItem[]>([]);
  const [ingSearch, setIngSearch] = useState("");
  const [ingResults, setIngResults] = useState<Ingrediente[]>([]);
  const [ingLoading, setIngLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const costoTotal = lineas.reduce((s, l) => s + l.cantidad * l._costo, 0);

  useEffect(() => {
    if (!open) return;
    if (gelatina) {
      setNombre(gelatina.nombre);
      setActivo(gelatina.activo);
      setLineas(
        gelatina.ingredientes.map((i) => ({
          ingredienteId: i.ingredienteId,
          cantidad: i.cantidad,
          _nombre: i.ingredienteNombre,
          _unidad: i.ingredienteUnidad,
          _costo: i.cantidad > 0 ? i.costoCalculado / i.cantidad : 0,
        })),
      );
    } else {
      setNombre("");
      setActivo(true);
      setLineas([]);
    }
    setError(null);
    setIngSearch("");
    setIngResults([]);
    setShowDropdown(false);
  }, [open, gelatina]);

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
        const d = await res.json();
        setIngResults(d.data ?? []);
        setShowDropdown(true);
      } finally {
        setIngLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [ingSearch]);

  const addIngrediente = useCallback((ing: Ingrediente) => {
    setLineas((p) => {
      if (p.some((l) => l.ingredienteId === ing.id)) return p;
      return [
        ...p,
        {
          ingredienteId: ing.id,
          cantidad: 0,
          _nombre: ing.nombre,
          _unidad: ing.unidadBase,
          _costo: ing.costoUnidadMinima ?? 0,
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
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        nombre: nombre.trim(),
        activo,
        ingredientes: lineas
          .filter((l) => l.cantidad > 0)
          .map((l) => ({ ingredienteId: l.ingredienteId, cantidad: l.cantidad })),
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
            <div className="pointer-events-auto w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#f5dce4] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <h2 className="font-bold text-[#7b2d42] text-lg">
                  {isEdit ? "Editar gelatina" : "Nueva gelatina"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Scrollable body */}
              <form
                id="gelatina-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
              >
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Gelatina de Agua…"
                    className={inputCls}
                  />
                </div>

                {/* Activo toggle */}
                <div className="flex items-center justify-between rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#3d1a24]">Activa</p>
                    <p className="text-[11px] text-[#b07a8a]">Visible en el cotizador</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivo((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${activo ? "bg-[#c0607a]" : "bg-[#e8c4cd]"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${activo ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="border-t border-[#f5dce4]" />

                {/* Ingredients section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                      Ingredientes
                    </p>
                    {costoTotal > 0 && (
                      <span className="text-[11px] font-bold text-[#c0607a]">
                        Costo: ${costoTotal.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <input
                      value={ingSearch}
                      onChange={(e) => setIngSearch(e.target.value)}
                      placeholder="Buscar ingrediente…"
                      className={inputCls}
                    />
                    {ingLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-[#c0607a]/30 border-t-[#c0607a] rounded-full animate-spin" />
                      </div>
                    )}
                    <AnimatePresence>
                      {showDropdown && ingResults.length > 0 && (
                        <motion.div
                          key="drop"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute z-10 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-[#f5dce4] shadow-lg overflow-hidden"
                        >
                          {ingResults.map((ing) => (
                            <button
                              key={ing.id}
                              type="button"
                              onClick={() => addIngrediente(ing)}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#fdf6f0] text-left transition"
                            >
                              <span className="font-medium text-[#3d1a24]">{ing.nombre}</span>
                              <span className="text-[11px] text-[#b07a8a]">{ing.unidadBase}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Line items */}
                  {lineas.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {lineas.map((l) => (
                        <div
                          key={l.ingredienteId}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#fdf6f0] border border-[#f5dce4]"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#3d1a24] truncate">{l._nombre}</p>
                            <p className="text-[10px] text-[#b07a8a]">
                              ${(l.cantidad * l._costo).toFixed(2)}
                            </p>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.cantidad || ""}
                            onChange={(e) => updateCantidad(l.ingredienteId, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded-lg border border-[#e8c4cd] text-sm text-right text-[#3d1a24] focus:outline-none focus:border-[#c0607a]"
                          />
                          <span className="text-[11px] text-[#b07a8a] w-10 shrink-0 truncate">{l._unidad}</span>
                          <button
                            type="button"
                            onClick={() => removeLinea(l.ingredienteId)}
                            className="p-1 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-500 transition shrink-0"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {lineas.length === 0 && (
                    <p className="text-[11px] text-[#c0a0a8] italic">Sin ingredientes. Busca y agrega arriba.</p>
                  )}
                </div>

                {error && (
                  <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </form>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="gelatina-form"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                >
                  {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear gelatina"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
