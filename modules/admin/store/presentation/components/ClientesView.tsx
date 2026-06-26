"use client";
// src/modules/admin/clientes/presentation/components/ClientesView.tsx

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useClientes } from "../hooks/useClientes";
import { ClienteModal } from "./ClienteModal";
import type {
  Cliente,
  CreateClienteDTO,
} from "../../domain/entities/Cliente.entity";

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
                    Eliminar cliente
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

export function ClientesView() {
  const {
    clientes,
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
  } = useClientes();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (c: Cliente, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(c);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (dto: CreateClienteDTO) => {
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
          placeholder="Buscar por nombre, teléfono o email…"
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
            : `${total} cliente${total !== 1 ? "s" : ""}`}
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
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#b07a8a] uppercase tracking-wider">
                Cuenta
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
            {!isLoading && clientes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[#c0a0a8] text-sm"
                >
                  No se encontraron clientes
                </td>
              </tr>
            )}
            {clientes.map((c) => (
              <tr
                key={c.id}
                onClick={() =>
                  router.push(`/admin/dashboard/store/clientes/${c.id}`)
                }
                className="hover:bg-[#fdf6f0]/60 transition group cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-[#3d1a24]">
                  {c.nombre}
                </td>
                <td className="px-4 py-3 text-[#7b2d42]/70">
                  {c.telefono ?? "—"}
                </td>
                <td className="px-4 py-3 text-[#7b2d42]/70">
                  {c.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.authUserId ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-green-50 text-green-700 border-green-200">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200">
                      Sin cuenta
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => openEdit(c, e)}
                      className="p-1.5 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] hover:text-[#c0607a] transition"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(c);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-600 transition"
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
        {clientes.map((c) => (
          <div
            key={c.id}
            onClick={() =>
              router.push(`/admin/dashboard/store/clientes/${c.id}`)
            }
            className="bg-white rounded-2xl border border-[#f5dce4] p-4 shadow-sm cursor-pointer active:bg-[#fdf6f0]/60 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#3d1a24]">{c.nombre}</p>
                <p className="text-[12px] text-[#b07a8a] mt-0.5">
                  {c.telefono ?? c.email ?? "Sin contacto"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={(e) => openEdit(c, e)}
                  className="p-2 rounded-lg hover:bg-[#f5dce4] text-[#b07a8a] transition"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(c);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-[#b07a8a] hover:text-red-600 transition"
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

      <ClienteModal
        open={modalOpen}
        cliente={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
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
