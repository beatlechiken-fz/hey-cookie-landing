"use client";
// src/modules/admin/store/presentation/components/BizchosView.tsx

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
              borderRight: "1px solid #f5dce4",
              boxShadow: "4px 0 32px rgba(123,45,66,0.10)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f5dce4] bg-[#fdf6f0]">
              <div className="flex items-center gap-2.5">
                <SlidersIcon className="w-4 h-4 text-[#c0607a]" />
                <h2 className="font-bold text-[#7b2d42] text-base">Filtros</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
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
              <p className="text-[11px] font-semibold text-[#b07a8a] uppercase tracking-widest mb-2">
                Buscar por nombre
              </p>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[#e8c4cd] text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] transition"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Vainilla, Chocolate…"
              />
            </div>
            <div className="px-6 py-4 border-t border-[#f5dce4] bg-[#fdf6f0] flex flex-col gap-2">
              {draft && (
                <button
                  onClick={() => setDraft("")}
                  className="w-full py-2 rounded-xl text-[13px] font-semibold text-[#b07a8a] hover:bg-[#f5dce4] transition"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={() => {
                  onSearchChange(draft);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#c0607a] text-white text-[14px] font-bold hover:bg-[#a84d66] transition"
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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />
          <motion.div
            key="dlg"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#f5dce4] p-6 flex flex-col gap-4">
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
                  <h3 className="font-bold text-[#3d1a24] text-base">
                    Eliminar bizcocho
                  </h3>
                  <p className="text-sm text-[#b07a8a]">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#7b2d42]">
                ¿Confirmas que deseas eliminar <strong>"{nombre}"</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
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
              ? "bg-[#c0607a] text-white border-[#c0607a]"
              : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]")
          }
        >
          <SlidersIcon className="w-4 h-4" />
          {search && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#c0607a]" />
          )}
        </button>

        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar bizcocho…"
            className="w-full pl-4 pr-28 py-2.5 rounded-xl border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 placeholder:text-[#c0a0a8]"
          />
          <div className="absolute right-[7.5rem] top-1/2 -translate-y-1/2 text-[#c0a0a8] pointer-events-none">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c0607a] text-white text-[13px] font-bold hover:bg-[#a84d66] transition"
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
        <p className="text-sm text-[#b07a8a]">
          {isLoading
            ? "Cargando…"
            : `${total} bizcocho${total !== 1 ? "s" : ""}`}
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
                Bizcocho
              </th>
              <th className="px-4 py-3 text-left   text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Ingredientes
              </th>
              <th className="px-4 py-3 text-right  text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Costo total
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
            {!isLoading && bizcochos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[#c0a0a8] text-sm"
                >
                  No se encontraron bizcochos
                </td>
              </tr>
            )}
            {bizcochos.map((b) => (
              <tr key={b.id} className="hover:bg-[#fdf6f0]/60 transition group">
                <td className="px-4 py-3 font-semibold text-[#3d1a24]">
                  {b.nombre}
                </td>
                <td className="px-4 py-3 text-[#7b2d42]/70 text-sm max-w-xs">
                  <p className="truncate">{b.descripcion ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-[#fdf6f0] border border-[#f5dce4] text-[11px] font-semibold text-[#b07a8a]">
                    {b.ingredientes.length}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#c0607a]">
                  ${b.costoTotal.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-[#c0607a] transition"
                    >
                      {editIcon}
                    </button>
                    <button
                      onClick={() => openDelete(b)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-600 transition"
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
          <p className="text-center text-[#c0a0a8] text-sm py-8">Cargando…</p>
        )}
        {!isLoading && bizcochos.length === 0 && (
          <p className="text-center text-[#c0a0a8] text-sm py-8">
            No se encontraron bizcochos
          </p>
        )}
        {bizcochos.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-[#f5dce4] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#3d1a24]">{b.nombre}</p>
                {b.descripcion && (
                  <p className="text-sm text-[#b07a8a] mt-0.5 line-clamp-2">
                    {b.descripcion}
                  </p>
                )}
                <div className="flex gap-3 mt-2">
                  <span className="text-[11px] text-[#b07a8a]">
                    {b.ingredientes.length} ingrediente
                    {b.ingredientes.length !== 1 ? "s" : ""}
                  </span>
                  <span className="font-bold text-[#c0607a] text-sm">
                    ${b.costoTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(b)}
                  className="p-2 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] transition"
                >
                  {editIcon}
                </button>
                <button
                  onClick={() => openDelete(b)}
                  className="p-2 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-600 transition"
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
            className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-[#b07a8a]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#7b2d42] text-sm hover:bg-[#fdf6f0] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
