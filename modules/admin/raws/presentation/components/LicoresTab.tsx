"use client";
// src/modules/admin/store/presentation/components/LicoresTab.tsx

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RawThumb } from "./RawThumb";
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
    "w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-sm focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition placeholder:text-hc-soft";

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
                    Cantidad de licor
                  </h2>
                  <p className="text-[12px] text-hc-muted mt-0.5">
                    {item.ingredienteNombre}
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
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
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
                  <div className="rounded-xl bg-hc-hover border border-hc-line px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[12px] text-hc-muted">
                      Costo estimado
                    </span>
                    <span className="font-bold text-hc-rose">
                      ${costoEst}
                    </span>
                  </div>
                )}

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
          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 placeholder:text-hc-soft"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-hc-soft pointer-events-none">
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
        <p className="text-sm text-hc-muted">
          {isLoading
            ? "Cargando…"
            : `${filtered.length} licor${filtered.length !== 1 ? "es" : ""}`}
        </p>
        {(error || actionError) && (
          <p className="text-sm text-red-600">{error ?? actionError}</p>
        )}
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block rounded-2xl border border-hc-line overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-hc-hover border-b border-hc-line">
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Licor
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Cantidad (24cm)
              </th>
              <th className="px-4 py-3 text-right  text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Costo estimado
              </th>
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Notas
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hc-line">
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-hc-soft text-sm"
                >
                  Cargando…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-hc-soft text-sm"
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
                  className="hover:bg-hc-hover/60 transition group"
                >
                  <td className="px-4 py-3 font-medium text-hc-ink">
                    <div className="flex items-center gap-3">
                      <RawThumb src={item.ingredienteImagenUrl} alt={item.ingredienteNombre} />
                      <span>{item.ingredienteNombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.cantidad != null ? (
                      <span className="font-semibold text-hc-soft">
                        {item.cantidad} ml
                      </span>
                    ) : (
                      <span className="text-hc-soft text-xs">
                        Sin definir
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-hc-rose">
                    {costoEst ? `$${costoEst}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-hc-soft/70 text-sm max-w-xs">
                    <p className="truncate">{item.notas ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition">
                      <button
                        onClick={() => setEditItem(item)}
                        className="p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition"
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
          <p className="text-center text-hc-soft text-sm py-8">Cargando…</p>
        )}
        {filtered.map((item) => {
          const costoEst =
            item.cantidad && item.costoUnidadMinima
              ? (item.cantidad * item.costoUnidadMinima).toFixed(2)
              : null;
          return (
            <div
              key={item.ingredienteId}
              className="bg-white rounded-2xl border border-hc-line p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <RawThumb src={item.ingredienteImagenUrl} alt={item.ingredienteNombre} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-hc-ink">
                    {item.ingredienteNombre}
                  </p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[12px] text-hc-muted">
                      {item.cantidad != null
                        ? `${item.cantidad} ml`
                        : "Sin cantidad"}
                    </span>
                    {costoEst && (
                      <span className="text-[12px] font-bold text-hc-rose">
                        ${costoEst}
                      </span>
                    )}
                  </div>
                  {item.notas && (
                    <p className="text-[11px] text-hc-muted mt-1">
                      {item.notas}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditItem(item)}
                  className="p-2 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition shrink-0"
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
