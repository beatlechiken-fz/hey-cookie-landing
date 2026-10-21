"use client";
// src/modules/admin/store/presentation/components/BizchosView.tsx

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RawThumb } from "./RawThumb";
import { useBizcochos } from "../hooks/useBizcochos";
import { BizcochoModal } from "./BizcochoModal";
import type {
  Bizcocho,
  CreateBizcochoDTO,
} from "../../domain/entities/Bizcocho.entity";

// ── Sliders icon ──────────────────────────────────────────────────────────────
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

// ── Filter Drawer ─────────────────────────────────────────────────────────────
function FilterDrawer({
  open,
  onClose,
  search,
  onSearchChange,
}: {
  open: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  const [draft, setDraft] = useState(search);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(search);
  }, [open, search]);

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
            className="fixed left-0 top-0 h-full w-[300px] z-50 flex flex-col bg-white"
            style={{
              borderRight: "1px solid #EFE6E2",
              boxShadow: "4px 0 32px rgba(123,45,66,0.10)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-hc-line bg-hc-hover">
              <div className="flex items-center gap-2.5">
                <SlidersIcon className="w-4 h-4 text-hc-rose" />
                <h2 className="font-bold text-hc-soft text-base">Filtros</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-hc-sunken transition text-hc-muted"
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
            <div className="flex-1 px-6 py-5">
              <p className="text-[11px] font-semibold text-hc-muted uppercase tracking-widest mb-2">
                Buscar por nombre
              </p>
              <input
                className="w-full px-3 py-2 rounded-lg border border-hc-line-strong text-sm text-hc-ink focus:outline-none focus:border-hc-rose transition"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Vainilla, Chocolate…"
              />
            </div>
            <div className="px-6 py-4 border-t border-hc-line bg-hc-hover flex flex-col gap-2">
              {draft && (
                <button
                  onClick={() => setDraft("")}
                  className="w-full py-2 rounded-xl text-[13px] font-semibold text-hc-muted hover:bg-hc-sunken transition"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={() => {
                  onSearchChange(draft);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-hc-rose text-white text-[14px] font-bold hover:bg-hc-rose-hover transition"
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

// ── Delete dialog ─────────────────────────────────────────────────────────────
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
                    Eliminar bizcocho
                  </h3>
                  <p className="text-sm text-hc-muted">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-sm text-hc-soft">
                ¿Confirmas que deseas eliminar <strong>"{nombre}"</strong>?
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

// ── Main view ─────────────────────────────────────────────────────────────────
export function BizchosView() {
  const {
    bizcochos,
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
    uploadImage,
  } = useBizcochos();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bizcocho | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bizcocho | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (b: Bizcocho) => {
    setEditTarget(b);
    setModalOpen(true);
  };
  const openDelete = (b: Bizcocho) => setDeleteTarget(b);

  const handleSave = useCallback(
    async (dto: CreateBizcochoDTO) => {
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

  const handleDuplicate = useCallback(
    async (b: Bizcocho) => {
      try {
        const dto: CreateBizcochoDTO = {
          nombre: `${b.nombre} (copia)`,
          descripcion: b.descripcion,
          elaboracion: b.elaboracion,
          imagenUrl: b.imagenUrl ?? null,
          ingredientes: b.ingredientes.map((i) => ({
            ingredienteId: i.ingredienteId,
            cantidad: i.cantidad,
          })),
        };
        const created = await create(dto);
        openEdit(created);
      } catch (e: any) {
        setActionError(e.message);
      }
    },
    [create],
  );

  const editIcon = (
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
  );
  const duplicateIcon = (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
  const deleteIcon = (
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
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className={
            "relative flex items-center justify-center w-10 h-10 rounded-xl border transition shrink-0 " +
            (search
              ? "bg-hc-rose text-white border-hc-rose"
              : "bg-white text-hc-soft border-hc-line-strong hover:bg-hc-hover")
          }
        >
          <SlidersIcon className="w-4 h-4" />
          {search && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-hc-rose" />
          )}
        </button>

        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar bizcocho…"
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
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-hc-muted">
          {isLoading
            ? "Cargando…"
            : `${total} bizcocho${total !== 1 ? "s" : ""}`}
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
                Bizcocho
              </th>
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Ingredientes
              </th>
              <th className="px-4 py-3 text-right  text-[11px] font-semibold text-hc-muted uppercase tracking-wider">
                Costo total
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
            {!isLoading && bizcochos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-hc-soft text-sm"
                >
                  No se encontraron bizcochos
                </td>
              </tr>
            )}
            {bizcochos.map((b) => (
              <tr key={b.id} className="hover:bg-hc-hover/60 transition group">
                <td className="px-4 py-3 font-semibold text-hc-ink">
                  <div className="flex items-center gap-3">
                    <RawThumb src={b.imagenUrl} alt={b.nombre} />
                    <span>{b.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-hc-soft/70 text-sm max-w-xs">
                  <p className="truncate">{b.descripcion ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-hc-hover border border-hc-line text-[11px] font-semibold text-hc-muted">
                    {b.ingredientes.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-hc-rose">
                  ${b.costoTotal.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition"
                    >
                      {editIcon}
                    </button>
                    <button
                      onClick={() => handleDuplicate(b)}
                      className="p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-soft transition"
                      aria-label="Duplicar"
                      title="Duplicar"
                    >
                      {duplicateIcon}
                    </button>
                    <button
                      onClick={() => openDelete(b)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-hc-muted hover:text-red-600 transition"
                    >
                      {deleteIcon}
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
        {isLoading && (
          <p className="text-center text-hc-soft text-sm py-8">Cargando…</p>
        )}
        {!isLoading && bizcochos.length === 0 && (
          <p className="text-center text-hc-soft text-sm py-8">
            No se encontraron bizcochos
          </p>
        )}
        {bizcochos.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-hc-line p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <RawThumb src={b.imagenUrl} alt={b.nombre} size="sm" />
                  <p className="font-semibold text-hc-ink">{b.nombre}</p>
                </div>
                {b.descripcion && (
                  <p className="text-sm text-hc-muted mt-0.5 line-clamp-2">
                    {b.descripcion}
                  </p>
                )}
                <div className="flex gap-3 mt-2">
                  <span className="text-[11px] text-hc-muted">
                    {b.ingredientes.length} ingrediente
                    {b.ingredientes.length !== 1 ? "s" : ""}
                  </span>
                  <span className="font-bold text-hc-rose text-sm">
                    ${b.costoTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(b)}
                  className="p-2 rounded-lg hover:bg-hc-sunken text-hc-muted transition"
                >
                  {editIcon}
                </button>
                <button
                  onClick={() => handleDuplicate(b)}
                  className="p-2 rounded-lg hover:bg-hc-sunken text-hc-muted transition"
                  aria-label="Duplicar"
                >
                  {duplicateIcon}
                </button>
                <button
                  onClick={() => openDelete(b)}
                  className="p-2 rounded-lg hover:bg-red-50 text-hc-muted hover:text-red-600 transition"
                >
                  {deleteIcon}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
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

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        search={search}
        onSearchChange={setSearch}
      />
      <BizcochoModal
        open={modalOpen}
        bizcocho={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onUploadImage={uploadImage}
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
