"use client";
// src/modules/admin/store/presentation/components/LicoresTab.tsx

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLicores, type LicorItem } from "../hooks/useIngredientes";
import type { UpsertLicorCantidadDTO } from "../../domain/entities/Ingrediente.entity";

// ── Modal editar cantidad ─────────────────────────────────────────────────────

function LicorCantidadModal({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: LicorItem | null;
  onClose: () => void;
  onSave: (dto: UpsertLicorCantidadDTO) => Promise<void>;
}) {
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    setCantidad(item.cantidad != null ? String(item.cantidad) : "");
    setNotas(item.notas ?? "");
    setError(null);
  }, [open, item]);

  const costoEst =
    cantidad && item?.costoUnidadMinima
      ? (Number(cantidad) * item.costoUnidadMinima).toFixed(2)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ingredienteId: item.ingredienteId,
        cantidad: cantidad ? Number(cantidad) : null,
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
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#c0a0a8]";

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
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#f5dce4] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0]">
                <div>
                  <h2 className="font-bold text-[#7b2d42] text-base">
                    Cantidad de licor
                  </h2>
                  <p className="text-[12px] text-[#b07a8a] mt-0.5">
                    {item.ingredienteNombre}
                  </p>
                </div>
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
                    Cantidad en <strong>ml</strong> para un{" "}
                    <strong>pastel de 24 cm</strong> de diámetro.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Cantidad (ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputCls}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 30"
                    autoFocus
                  />
                </div>

                {costoEst && (
                  <div className="rounded-xl bg-[#fdf6f0] border border-[#f5dce4] px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[12px] text-[#b07a8a]">
                      Costo estimado
                    </span>
                    <span className="font-bold text-[#c0607a]">
                      ${costoEst}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                    Notas{" "}
                    <span className="text-[#c0a0a8] normal-case font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: agregar al jarabe, solo para relleno…"
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

// ── Main Tab ──────────────────────────────────────────────────────────────────

export function LicoresTab() {
  const { items, isLoading, error, upsertCantidad } = useLicores();
  const [editItem, setEditItem] = useState<LicorItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.ingredienteNombre.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = useCallback(
    async (dto: UpsertLicorCantidadDTO) => {
      try {
        await upsertCantidad(dto);
      } catch (e: any) {
        setActionError(e.message);
        throw e;
      }
    },
    [upsertCantidad],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar licor…"
          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 placeholder:text-[#c0a0a8]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0a0a8] pointer-events-none">
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
      </div>

      {/* Nota */}
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
        <p className="text-[12px] text-amber-800">
          Las cantidades se basan en un{" "}
          <strong>pastel de 24 cm de diámetro</strong>. Para agregar un licor
          nuevo, créalo en <strong>Insumos</strong> con categoría{" "}
          <em>Licores y bebidas</em> y aparecerá aquí automáticamente.
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#b07a8a]">
          {isLoading
            ? "Cargando…"
            : `${filtered.length} licor${filtered.length !== 1 ? "es" : ""}`}
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
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Licor
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Cantidad (24cm)
              </th>
              <th className="px-4 py-3 text-right  text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Costo estimado
              </th>
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Notas
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f9eef2]">
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[#c0a0a8] text-sm"
                >
                  Cargando…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[#c0a0a8] text-sm"
                >
                  No se encontraron licores
                </td>
              </tr>
            )}
            {filtered.map((item) => {
              const costoEst =
                item.cantidad && item.costoUnidadMinima
                  ? (item.cantidad * item.costoUnidadMinima).toFixed(2)
                  : null;
              return (
                <tr
                  key={item.ingredienteId}
                  className="hover:bg-[#fdf6f0]/60 transition group"
                >
                  <td className="px-4 py-3 font-medium text-[#3d1a24]">
                    {item.ingredienteNombre}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.cantidad != null ? (
                      <span className="font-semibold text-[#7b2d42]">
                        {item.cantidad} ml
                      </span>
                    ) : (
                      <span className="text-[#c0a0a8] text-xs">
                        Sin definir
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#c0607a]">
                    {costoEst ? `$${costoEst}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#7b2d42]/70 text-sm max-w-xs">
                    <p className="truncate">{item.notas ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setEditItem(item)}
                        className="p-1.5 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-[#c0607a] transition"
                        title="Editar cantidad"
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="flex md:hidden flex-col gap-3">
        {isLoading && (
          <p className="text-center text-[#c0a0a8] text-sm py-8">Cargando…</p>
        )}
        {filtered.map((item) => {
          const costoEst =
            item.cantidad && item.costoUnidadMinima
              ? (item.cantidad * item.costoUnidadMinima).toFixed(2)
              : null;
          return (
            <div
              key={item.ingredienteId}
              className="bg-white rounded-2xl border border-[#f5dce4] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3d1a24]">
                    {item.ingredienteNombre}
                  </p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[12px] text-[#b07a8a]">
                      {item.cantidad != null
                        ? `${item.cantidad} ml`
                        : "Sin cantidad"}
                    </span>
                    {costoEst && (
                      <span className="text-[12px] font-bold text-[#c0607a]">
                        ${costoEst}
                      </span>
                    )}
                  </div>
                  {item.notas && (
                    <p className="text-[11px] text-[#b07a8a] mt-1">
                      {item.notas}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditItem(item)}
                  className="p-2 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-[#c0607a] transition shrink-0"
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
              </div>
            </div>
          );
        })}
      </div>

      <LicorCantidadModal
        open={Boolean(editItem)}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleSave}
      />
    </div>
  );
}
