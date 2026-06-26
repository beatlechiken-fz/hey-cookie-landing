"use client";
// src/modules/admin/store/presentation/components/EmpaquesView.tsx

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmpaques } from "../hooks/useEmpaques";
import { EmpaqueModal } from "./EmpaqueModal";
import type {
  Empaque,
  CreateEmpaqueDTO,
} from "../../domain/entities/Empaque.entity";

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
                    Eliminar empaque
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

export function EmpaquesView() {
  const {
    empaques,
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
  } = useEmpaques();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Empaque | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Empaque | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (e: Empaque) => {
    setEditTarget(e);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (dto: CreateEmpaqueDTO) => {
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
          placeholder="Buscar empaque…"
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#b07a8a]">
          {isLoading
            ? "Cargando…"
            : `${total} empaque${total !== 1 ? "s" : ""}`}
        </p>
        {(error || actionError) && (
          <p className="text-sm text-red-600">{error ?? actionError}</p>
        )}
      </div>

      {/* Grid de empaques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {isLoading && (
          <p className="col-span-full text-center text-[#c0a0a8] text-sm py-8">
            Cargando…
          </p>
        )}
        {!isLoading && empaques.length === 0 && (
          <p className="col-span-full text-center text-[#c0a0a8] text-sm py-8">
            No se encontraron empaques
          </p>
        )}
        {empaques.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-2xl border border-[#f5dce4] overflow-hidden shadow-sm group hover:border-[#e8c4cd] transition flex flex-col"
          >
            <div className="aspect-square bg-[#fdf6f0] overflow-hidden relative">
              {emp.imagenUrl ? (
                <img
                  src={emp.imagenUrl}
                  alt={emp.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-[#e8c4cd]"
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
                </div>
              )}
              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => openEdit(emp)}
                  className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#b07a8a] hover:text-[#c0607a] shadow-sm transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5"
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
                  onClick={() => setDeleteTarget(emp)}
                  className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#b07a8a] hover:text-red-600 shadow-sm transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5"
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
            <div className="p-3 flex flex-col gap-0.5">
              <p className="font-medium text-[#3d1a24] text-[13px] leading-snug line-clamp-2">
                {emp.nombre}
              </p>
              <p className="font-bold text-[#c0607a] text-sm">
                ${emp.precio.toFixed(2)}
              </p>
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

      <EmpaqueModal
        open={modalOpen}
        empaque={editTarget}
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
