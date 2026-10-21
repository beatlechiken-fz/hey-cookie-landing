"use client";
// src/modules/admin/store/presentation/components/CuponesView.tsx

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCupones } from "../hooks/useCupones";
import { CuponModal } from "./CuponModal";
import { ORDEN_STATUS_LABELS } from "../../domain/entities/Orden.entity";
import type { Cupon, CreateCuponDTO } from "../../domain/entities/Cupon.entity";

function DeleteDialog({
  open,
  codigo,
  onClose,
  onConfirm,
}: {
  open: boolean;
  codigo: string;
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
            className="fixed inset-0 bg-hc-cacao/25 backdrop-blur-[2px] z-40"
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line p-6 flex flex-col gap-4">
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
                  <h3 className="font-bold text-hc-ink text-base">
                    Eliminar cupón
                  </h3>
                  <p className="text-sm text-hc-muted">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-sm text-hc-soft">
                ¿Confirmas que deseas eliminar <strong>"{codigo}"</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-hc-line-strong text-hc-muted text-sm font-semibold hover:bg-hc-hover transition"
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

function StatusBadge({ cupon }: { cupon: Cupon }) {
  const now = new Date();
  let label = "Activo";
  let cls = "bg-green-50 text-green-700 border-green-200";

  if (!cupon.activo) {
    label = "Inactivo";
    cls = "bg-gray-50 text-gray-500 border-gray-200";
  } else if (cupon.fechaFin && new Date(cupon.fechaFin) < now) {
    label = "Expirado";
    cls = "bg-red-50 text-red-600 border-red-200";
  } else if (cupon.fechaInicio && new Date(cupon.fechaInicio) > now) {
    label = "Programado";
    cls = "bg-blue-50 text-blue-600 border-blue-200";
  } else if (
    cupon.usosMaximos != null &&
    cupon.usosActuales >= cupon.usosMaximos
  ) {
    label = "Agotado";
    cls = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <span
      className={
        "px-2 py-0.5 rounded-full text-[11px] font-semibold border " + cls
      }
    >
      {label}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: "global" | "individual" }) {
  return tipo === "global" ? (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-indigo-50 text-indigo-600 border-indigo-200">
      Global
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-pink-50 text-pink-600 border-pink-200">
      Individual
    </span>
  );
}

export function CuponesView() {
  const {
    cupones,
    total,
    totalPages,
    page,
    search,
    isLoading,
    error,
    setSearch,
    setPage,
    create,
    update,
    remove,
  } = useCupones();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cupon | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (c: Cupon) => {
    setEditTarget(c);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (dto: CreateCuponDTO) => {
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

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código…"
          className="w-full pl-4 pr-28 py-2.5 rounded-xl border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 placeholder:text-hc-soft"
        />
        <div className="absolute right-[7.5rem] top-1/2 -translate-y-1/2 text-hc-soft pointer-events-none">
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
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hc-rose text-white text-[13px] font-bold hover:bg-hc-rose-hover transition"
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-hc-muted">
          {isLoading ? "Cargando…" : `${total} cupón${total !== 1 ? "es" : ""}`}
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
                Código
              </th>
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Descuento
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Usos
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hc-line">
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-hc-soft text-sm"
                >
                  Cargando…
                </td>
              </tr>
            )}
            {!isLoading && cupones.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-hc-soft text-sm"
                >
                  No se encontraron cupones
                </td>
              </tr>
            )}
            {cupones.map((c) => (
              <tr key={c.id} className="hover:bg-hc-hover/60 transition group">
                <td className="px-4 py-3">
                  <p className="font-bold text-hc-ink tracking-wide">
                    {c.codigo}
                  </p>
                  {c.descripcion && (
                    <p className="text-[11px] text-hc-muted">
                      {c.descripcion}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-hc-rose">
                  {c.tipoDescuento === "porcentaje"
                    ? `${c.valor}%`
                    : `$${c.valor}`}
                </td>
                <td className="px-4 py-3 text-center">
                  <TipoBadge tipo={c.tipo} />
                </td>
                <td className="px-4 py-3 text-center text-hc-soft">
                  {c.usosActuales}
                  {c.usosMaximos != null ? ` / ${c.usosMaximos}` : ""}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge cupon={c} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition"
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
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-hc-muted hover:text-red-600 transition"
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
        {cupones.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-hc-line p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-hc-ink tracking-wide">
                  {c.codigo}
                </p>
                {c.descripcion && (
                  <p className="text-[12px] text-hc-muted mt-0.5">
                    {c.descripcion}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-medium text-hc-rose text-sm">
                    {c.tipoDescuento === "porcentaje"
                      ? `${c.valor}%`
                      : `$${c.valor}`}
                  </span>
                  <TipoBadge tipo={c.tipo} />
                  <StatusBadge cupon={c} />
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="p-2 rounded-lg hover:bg-hc-sunken text-hc-muted transition"
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
                  onClick={() => setDeleteTarget(c)}
                  className="p-2 rounded-lg hover:bg-red-50 text-hc-muted hover:text-red-600 transition"
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
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-soft text-sm hover:bg-hc-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-hc-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-soft text-sm hover:bg-hc-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Siguiente →
          </button>
        </div>
      )}

      <CuponModal
        open={modalOpen}
        cupon={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      <DeleteDialog
        open={Boolean(deleteTarget)}
        codigo={deleteTarget?.codigo ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
