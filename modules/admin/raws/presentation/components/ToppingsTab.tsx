"use client";
// src/modules/admin/store/presentation/components/ToppingsTab.tsx

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToppings, type ToppingItem } from "../hooks/useIngredientes";
import { ToppingCantidadModal } from "./ToppingCantidadModal";
import type { UpsertToppingCantidadDTO } from "../../domain/entities/Ingrediente.entity";

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
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-amber-600"
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
                    Quitar de toppings
                  </h3>
                  <p className="text-sm text-[#b07a8a]">
                    El ingrediente seguirá existiendo en el catálogo
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#7b2d42]">
                ¿Confirmas que deseas quitar <strong>"{nombre}"</strong> de la
                lista de toppings?
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
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition"
                >
                  Quitar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ToppingsTab() {
  const { items, isLoading, error, upsertCantidad, removeTopping } =
    useToppings();
  const [editItem, setEditItem] = useState<ToppingItem | null>(null);
  const [removeItem, setRemoveItem] = useState<ToppingItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.ingrediente.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = useCallback(
    async (dto: UpsertToppingCantidadDTO) => {
      await upsertCantidad(dto);
    },
    [upsertCantidad],
  );

  const handleRemove = useCallback(async () => {
    if (!removeItem) return;
    try {
      await removeTopping(removeItem.ingrediente.id);
      setRemoveItem(null);
    } catch (e: any) {
      setActionError(e.message);
    }
  }, [removeItem, removeTopping]);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar topping…"
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
          <strong>pastel de 24 cm de diámetro</strong>. Para agregar un
          ingrediente como topping hazlo desde la pestaña Insumos.
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#b07a8a]">
          {isLoading
            ? "Cargando…"
            : `${filtered.length} topping${filtered.length !== 1 ? "s" : ""}`}
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
                Topping
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
                  No se encontraron toppings
                </td>
              </tr>
            )}
            {filtered.map((item) => {
              const { ingrediente, cantidad } = item;
              const costoEst =
                cantidad?.cantidad && ingrediente.costoUnidadMinima
                  ? (cantidad.cantidad * ingrediente.costoUnidadMinima).toFixed(
                      2,
                    )
                  : null;
              return (
                <tr
                  key={ingrediente.id}
                  className="hover:bg-[#fdf6f0]/60 transition group"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#3d1a24]">
                      {ingrediente.nombre}
                    </p>
                    <p className="text-[11px] text-[#b07a8a]">
                      {ingrediente.unidadBase}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {cantidad?.cantidad != null ? (
                      <span className="font-semibold text-[#7b2d42]">
                        {cantidad.cantidad} {ingrediente.unidadBase}
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
                    <p className="truncate">{cantidad?.notas ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      {/* Editar cantidad */}
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
                      {/* Quitar de toppings */}
                      <button
                        onClick={() => setRemoveItem(item)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-[#b07a8a] hover:text-amber-600 transition"
                        title="Quitar de toppings"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M15 9l-6 6M9 9l6 6" />
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
          const { ingrediente, cantidad } = item;
          const costoEst =
            cantidad?.cantidad && ingrediente.costoUnidadMinima
              ? (cantidad.cantidad * ingrediente.costoUnidadMinima).toFixed(2)
              : null;
          return (
            <div
              key={ingrediente.id}
              className="bg-white rounded-2xl border border-[#f5dce4] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3d1a24]">
                    {ingrediente.nombre}
                  </p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[12px] text-[#b07a8a]">
                      {cantidad?.cantidad != null
                        ? `${cantidad.cantidad} ${ingrediente.unidadBase}`
                        : "Sin cantidad"}
                    </span>
                    {costoEst && (
                      <span className="text-[12px] font-bold text-[#c0607a]">
                        ${costoEst}
                      </span>
                    )}
                  </div>
                  {cantidad?.notas && (
                    <p className="text-[11px] text-[#b07a8a] mt-1">
                      {cantidad.notas}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditItem(item)}
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
                    onClick={() => setRemoveItem(item)}
                    className="p-2 rounded-lg hover:bg-amber-50 text-[#b07a8a] hover:text-amber-600 transition"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ToppingCantidadModal
        open={Boolean(editItem)}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleSave}
      />
      <DeleteDialog
        open={Boolean(removeItem)}
        nombre={removeItem?.ingrediente.nombre ?? ""}
        onClose={() => setRemoveItem(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
