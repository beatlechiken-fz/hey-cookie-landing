"use client";
// src/modules/admin/productos/presentation/components/ProductosView.tsx

import { useState, useImperativeHandle, type Ref } from "react";
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

/** Acciones que la vista padre (ServiciosView) puede disparar sobre el listado. */
export interface ProductosViewHandle {
  /** Crea el producto y abre su editor — mismo flujo que "Duplicar". */
  crearYEditar: (dto: CreateProductoDTO) => Promise<void>;
}

export function ProductosView({ ref }: { ref?: Ref<ProductosViewHandle> }) {
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

  useImperativeHandle(ref, () => ({
    crearYEditar: async (dto) => {
      setEditing(await create(dto));
    },
  }));

  async function handleDuplicate(p: Producto) {
    const dto: CreateProductoDTO = {
      nombre: `${p.nombre} (copia)`,
      descripcion: p.descripcion,
      imagenUrl: p.imagenUrl,
      linea: p.linea,
      categoria: p.categoria,
      elaboracion: p.elaboracion,
      ingredientesBase: p.ingredientesBase,
      opcionesDefault: p.opcionesDefault,
      medidaBaseCm: p.medidaBaseCm,
      permiteMedidaPersonalizada: p.permiteMedidaPersonalizada,
      tamanosFijos: p.tamanosFijos,
      factorOpciones: p.factorOpciones,
      manoDeObraMinimo: p.manoDeObraMinimo,
      precioEstablecido: p.precioEstablecido,
    };
    const created = await create(dto);
    setEditing(created);
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
            className="w-full px-4 py-2.5 rounded-xl border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 placeholder:text-hc-soft"
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
                  ? "bg-hc-rose text-white border-hc-rose"
                  : "bg-white text-hc-soft border-hc-line-strong hover:bg-hc-hover")
              }
            >
              {l.label}
            </button>
          ))}
          {/* Botón crear */}
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-hc-soft text-white text-[12px] font-bold hover:bg-hc-ink transition"
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
        <p className="text-center text-hc-soft text-sm py-8">Cargando…</p>
      )}

      {!isLoading && productos.length === 0 && (
        <div className="rounded-2xl border border-hc-line bg-hc-hover py-12 text-center">
          <p className="text-hc-soft text-sm mb-3">
            No hay productos en esta categoría
          </p>
          <button
            onClick={() => setEditing("new")}
            className="px-4 py-2 rounded-xl bg-hc-rose text-white text-sm font-semibold hover:bg-hc-rose-hover transition"
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
              onDuplicate={(e) => {
                e.stopPropagation();
                handleDuplicate(p);
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
            className="absolute inset-0 bg-hc-cacao/25 backdrop-blur-[2px]"
            onClick={() => setDeleting(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line p-6 max-w-sm w-full z-10">
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
                <p className="font-bold text-hc-ink">Eliminar producto</p>
                <p className="text-[13px] text-hc-muted">{deleting.nombre}</p>
              </div>
            </div>
            <p className="text-[13px] text-hc-soft mb-5">
              El producto se marcará como inactivo y dejará de aparecer en el
              catálogo. Esta acción se puede revertir.
            </p>
            {delError && (
              <p className="text-sm text-red-600 mb-3">{delError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl border border-hc-line-strong text-hc-muted text-sm font-semibold hover:bg-hc-hover transition"
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
