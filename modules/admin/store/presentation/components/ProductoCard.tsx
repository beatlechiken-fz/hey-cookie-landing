"use client";
// src/modules/admin/productos/presentation/components/ProductoCard.tsx

import Image from "next/image";
import {
  etiquetaTamanoPredeterminado,
  type Producto,
} from "../../domain/entities/Producto.entity";

/** Tamaño predeterminado y, si hay más, cuántas opciones tiene ("2 L · 3 tamaños"). */
function resumenTamano(producto: Producto): string {
  const predeterminado = etiquetaTamanoPredeterminado(producto);
  if (!predeterminado) return "Tamaño único";
  if (producto.permiteMedidaPersonalizada) return `${predeterminado} · personalizable`;
  const n = producto.tamanosFijos.length;
  return n > 1 ? `${predeterminado} · ${n} tamaños` : predeterminado;
}

interface Props {
  producto: Producto;
  /** Lo que incluye con sus opciones por defecto (los mismos chips de la página). */
  incluye?: string[];
  /** Sugerido con opciones por defecto y medida base, redondeado. */
  precioSugerido?: number | null;
  /** Precio fijo del producto (o de su primer tamaño), si tiene. */
  precioFijo?: number | null;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onToggleActivo: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const LINEA_LABELS: Record<string, { label: string; cls: string }> = {
  sweet: { label: "Sweet", cls: "bg-pink-50 text-pink-700 border-pink-200" },
  fitness: {
    label: "Fitness",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  healthy: {
    label: "Healthy",
    cls: "bg-green-50 text-green-700 border-green-200",
  },
};

/** Chips visibles; el resto se resume en "+N". */
const MAX_CHIPS = 3;
const pesos = (n: number) => `$${n.toFixed(0)}`;

export function ProductoCard({ producto, incluye = [], precioSugerido, precioFijo, onClick, onEdit, onDuplicate, onToggleActivo, onDelete }: Props) {
  const linea = LINEA_LABELS[producto.linea] ?? LINEA_LABELS.sweet;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-hc-line shadow-sm hover:shadow-md hover:border-hc-line-strong transition overflow-hidden">
      {/* Imagen / placeholder */}
      {/* div con rol de botón: un <button> no puede contener los botones de acciones. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="text-left flex flex-col flex-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-hc-rose/40"
      >
        <div className="relative w-full aspect-[4/3] bg-hc-hover">
          {producto.imagenUrl ? (
            <Image
              src={producto.imagenUrl}
              alt={producto.nombre}
              fill
              className={`object-cover ${producto.activo ? "" : "opacity-50 grayscale"}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-hc-line-strong">
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          {/* Badge línea */}
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${linea.cls}`}
          >
            {linea.label}
          </span>
          {!producto.activo && (
            <span className="absolute bottom-2 left-2 rounded-full border border-hc-line-strong bg-white/95 px-2 py-0.5 text-[10px] font-bold text-hc-muted">
              Inactivo
            </span>
          )}

          {/* Botones editar/eliminar — aparecen al hover */}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              title="Editar"
              className="p-1.5 rounded-lg bg-white/90 border border-hc-line-strong text-hc-soft hover:bg-hc-hover hover:text-hc-rose shadow-sm transition backdrop-blur-sm"
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
              onClick={onDuplicate}
              title="Duplicar"
              className="p-1.5 rounded-lg bg-white/90 border border-hc-line-strong text-hc-soft hover:bg-hc-hover hover:text-hc-rose shadow-sm transition backdrop-blur-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              onClick={onToggleActivo}
              title={producto.activo ? "Desactivar (ocultar en la página)" : "Activar (mostrar en la página)"}
              aria-label={producto.activo ? "Desactivar producto" : "Activar producto"}
              className="p-1.5 rounded-lg bg-white/90 border border-hc-line-strong text-hc-soft hover:bg-hc-hover hover:text-hc-rose shadow-sm transition backdrop-blur-sm"
            >
              {producto.activo ? (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1.1" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              )}
            </button>
            <button
              onClick={onDelete}
              title="Eliminar"
              className="p-1.5 rounded-lg bg-white/90 border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 shadow-sm transition backdrop-blur-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1">
          <p className="font-semibold text-hc-ink text-[14px] leading-tight group-hover:text-hc-rose transition">
            {producto.nombre}
          </p>
          {producto.descripcion && (
            <p className="text-[12px] text-hc-muted line-clamp-2">
              {producto.descripcion}
            </p>
          )}
          {incluye.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1" aria-label="Incluye">
              {incluye.slice(0, MAX_CHIPS).map((nombre) => (
                <span
                  key={nombre}
                  className="max-w-full truncate rounded-full border border-hc-line bg-hc-hover px-2 py-0.5 text-[10.5px] font-medium text-hc-muted"
                >
                  {nombre}
                </span>
              ))}
              {incluye.length > MAX_CHIPS && (
                <span
                  title={incluye.slice(MAX_CHIPS).join(", ")}
                  className="rounded-full border border-hc-line bg-hc-hover px-2 py-0.5 text-[10.5px] font-semibold text-hc-soft"
                >
                  +{incluye.length - MAX_CHIPS}
                </span>
              )}
            </div>
          )}
          {(precioFijo != null || precioSugerido != null) && (
            <dl className="mt-1.5 grid grid-cols-2 gap-1.5">
              <div className="rounded-lg bg-hc-hover px-2 py-1">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-hc-soft">Sugerido</dt>
                <dd className="text-[14px] font-bold tabular-nums text-hc-ink">
                  {precioSugerido != null ? pesos(precioSugerido) : "—"}
                </dd>
              </div>
              {precioFijo != null && (
                <div className="rounded-lg border border-hc-rose/25 bg-hc-rose/5 px-2 py-1">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-hc-rose">Fijo</dt>
                  <dd className="text-[14px] font-bold tabular-nums text-hc-rose">{pesos(precioFijo)}</dd>
                </div>
              )}
            </dl>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[11px] font-medium ${etiquetaTamanoPredeterminado(producto) ? "text-hc-rose" : "text-hc-muted"}`}
            >
              {resumenTamano(producto)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
