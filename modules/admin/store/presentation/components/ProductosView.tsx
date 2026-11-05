"use client";
// src/modules/admin/productos/presentation/components/ProductosView.tsx

import { useState, useImperativeHandle, type Ref } from "react";
import { useProductos, type EstadoProducto } from "../hooks/useProductos";
import { ProductoCard } from "./ProductoCard";
import { ProductoConfiguradorModal } from "./ProductoConfiguradorModal";
import { ProductoEditorModal } from "./ProductoEditorModal";
import type {
  Producto,
  CreateProductoDTO,
  LineaProducto,
  CategoriaProducto,
} from "../../domain/entities/Producto.entity";

const LINEAS: { value: LineaProducto | ""; label: string }[] = [
  { value: "", label: "Todas las líneas" },
  { value: "sweet", label: "Sweet" },
  { value: "fitness", label: "Fitness" },
  { value: "healthy", label: "Healthy" },
];

const ESTADOS: { value: EstadoProducto; label: string }[] = [
  { value: "", label: "Activos e inactivos" },
  { value: "activo", label: "Solo activos" },
  { value: "inactivo", label: "Solo inactivos" },
];

// "sin" = productos sin tipo asignado.
const TIPOS: { value: CategoriaProducto | "" | "sin"; label: string }[] = [
  { value: "", label: "Todos los tipos" },
  { value: "cookie", label: "Galletas" },
  { value: "pastel", label: "Pasteles" },
  { value: "gelatina", label: "Gelatinas" },
  { value: "dessert", label: "Repostería" },
  { value: "sin", label: "Sin tipo" },
];

/** Select del toolbar con flecha propia (el nativo varía por navegador). */
function FiltroSelect<T extends string>({
  value,
  onChange,
  opciones,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  opciones: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="h-10 cursor-pointer appearance-none rounded-xl border border-hc-line-strong bg-white pl-3.5 pr-9 text-[13.5px] font-medium text-hc-ink transition hover:border-hc-soft focus:border-hc-rose focus:outline-none focus:ring-4 focus:ring-hc-rose/10"
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hc-soft" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

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
    estado,
    setSearch,
    setLinea,
    setEstado,
    create,
    update,
    remove,
    uploadImage,
  } = useProductos();

  // El tipo se filtra aquí (la API ya filtra búsqueda y línea).
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>("");
  const productosVisibles =
    tipo === "" ? productos : productos.filter((p) => (tipo === "sin" ? !p.categoria : p.categoria === tipo));

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

  async function handleToggleActivo(p: Producto) {
    try {
      await update(p.id, { activo: !p.activo });
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo cambiar el estado");
    }
  }

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
      coleccion: p.coleccion,
      activo: p.activo,
    };
    const created = await create(dto);
    setEditing(created);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: búsqueda, línea y tipo en una línea; "Nuevo producto" a la derecha */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-hc-line-strong bg-white px-3.5 text-hc-soft transition focus-within:border-hc-rose focus-within:ring-4 focus-within:ring-hc-rose/10 sm:max-w-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="m21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            aria-label="Buscar producto"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-hc-ink placeholder:text-hc-soft focus:outline-none"
          />
        </label>
        <FiltroSelect value={linea} onChange={setLinea} opciones={LINEAS} label="Filtrar por línea" />
        <FiltroSelect value={tipo} onChange={setTipo} opciones={TIPOS} label="Filtrar por tipo de producto" />
        <FiltroSelect value={estado} onChange={setEstado} opciones={ESTADOS} label="Filtrar por estado" />
        <button
          onClick={() => setEditing("new")}
          className="ml-auto flex h-10 items-center gap-2 rounded-xl bg-hc-rose px-4 text-[13.5px] font-semibold text-white shadow-[0_2px_8px_-2px_rgba(168,77,102,0.45)] transition hover:bg-hc-rose-hover active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo producto
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && (
        <p className="text-center text-hc-soft text-sm py-8">Cargando…</p>
      )}

      {!isLoading && productosVisibles.length === 0 && (
        <div className="rounded-2xl border border-hc-line bg-hc-hover py-12 text-center">
          <p className="text-hc-soft text-sm mb-3">
            No hay productos con estos filtros
          </p>
          <button
            onClick={() => setEditing("new")}
            className="px-4 py-2 rounded-xl bg-hc-rose text-white text-sm font-semibold hover:bg-hc-rose-hover transition"
          >
            Crear primer producto
          </button>
        </div>
      )}

      {!isLoading && productosVisibles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosVisibles.map((p) => (
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
              onToggleActivo={(e) => {
                e.stopPropagation();
                handleToggleActivo(p);
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
              El producto desaparecerá del admin y de la página. Si solo
              quieres ocultarlo a los clientes, márcalo como inactivo.
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
