"use client";
// src/modules/admin/productos/presentation/components/ProductosView.tsx

import { useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { ProductoCard } from "./ProductoCard";
import { ProductoConfiguradorModal } from "./ProductoConfiguradorModal";
import { ProductoEditorModal } from "./ProductoEditorModal";
import type {
  Producto,
  CreateProductoDTO,
  LineaProducto,
} from "../../domain/entities/Producto.entity";

const LINEAS: { value: LineaProducto | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "sweet", label: "Sweet" },
  { value: "fitness", label: "Fitness" },
  { value: "healthy", label: "Healthy" },
];

export function ProductosView() {
  const {
    productos,
    isLoading,
    error,
    search,
    linea,
    setSearch,
    setLinea,
    create,
    update,
    remove,
    uploadImage,
  } = useProductos();

  // Modal de cotización (configurador para el cliente)
  const [selected, setSelected] = useState<Producto | null>(null);

  // Modal de edición (CRUD admin)
  const [editing, setEditing] = useState<Producto | null | "new">(null);

  // Confirmación de eliminación
  const [deleting, setDeleting] = useState<Producto | null>(null);
  const [deleting2, setDeleting2] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSave(dto: CreateProductoDTO, id?: string) {
    if (id) await update(id, dto);
    else await create(dto);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleting2(true);
    setDelError(null);
    try {
      await remove(deleting.id);
      setDeleting(null);
    } catch (e: any) {
      setDelError(e.message);
    } finally {
      setDeleting2(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full px-4 py-2.5 rounded-xl border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 placeholder:text-[#c0a0a8]"
          />
        </div>
        <div className="flex gap-2">
          {LINEAS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLinea(l.value)}
              className={
                "px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition " +
                (linea === l.value
                  ? "bg-[#c0607a] text-white border-[#c0607a]"
                  : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]")
              }
            >
              {l.label}
            </button>
          ))}
          {/* Botón crear */}
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#7b2d42] text-white text-[12px] font-bold hover:bg-[#5a1e2e] transition"
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
            Nuevo producto
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && (
        <p className="text-center text-[#c0a0a8] text-sm py-8">Cargando…</p>
      )}

      {!isLoading && productos.length === 0 && (
        <div className="rounded-2xl border border-[#f5dce4] bg-[#fdf6f0] py-12 text-center">
          <p className="text-[#c0a0a8] text-sm mb-3">
            No hay productos en esta categoría
          </p>
          <button
            onClick={() => setEditing("new")}
            className="px-4 py-2 rounded-xl bg-[#c0607a] text-white text-sm font-semibold hover:bg-[#a84d66] transition"
          >
            Crear primer producto
          </button>
        </div>
      )}

      {!isLoading && productos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <ProductoCard
              key={p.id}
              producto={p}
              onClick={() => setSelected(p)}
              onEdit={(e) => {
                e.stopPropagation();
                setEditing(p);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                setDeleting(p);
                setDelError(null);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal cotizador (cliente) */}
      <ProductoConfiguradorModal
        producto={selected}
        onClose={() => setSelected(null)}
      />

      {/* Modal editor (admin CRUD) */}
      <ProductoEditorModal
        producto={editing === "new" ? null : editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onUploadImage={uploadImage}
      />

      {/* Confirmación de eliminación */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setDeleting(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#f5dce4] p-6 max-w-sm w-full z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[#3d1a24]">Eliminar producto</p>
                <p className="text-[13px] text-[#b07a8a]">{deleting.nombre}</p>
              </div>
            </div>
            <p className="text-[13px] text-[#7b2d42] mb-5">
              El producto se marcará como inactivo y dejará de aparecer en el
              catálogo. Esta acción se puede revertir.
            </p>
            {delError && (
              <p className="text-sm text-red-600 mb-3">{delError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting2}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition"
              >
                {deleting2 ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
