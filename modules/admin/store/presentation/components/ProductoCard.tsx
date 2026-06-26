"use client";
// src/modules/admin/productos/presentation/components/ProductoCard.tsx

import Image from "next/image";
import type { Producto } from "../../domain/entities/Producto.entity";

interface Props {
  producto: Producto;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
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

export function ProductoCard({ producto, onClick, onEdit, onDelete }: Props) {
  const linea = LINEA_LABELS[producto.linea] ?? LINEA_LABELS.sweet;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-[#f5dce4] shadow-sm hover:shadow-md hover:border-[#e8c4cd] transition overflow-hidden">
      {/* Imagen / placeholder */}
      <button
        onClick={onClick}
        className="text-left flex flex-col flex-1 focus:outline-none"
      >
        <div className="relative w-full aspect-[4/3] bg-[#fdf6f0]">
          {producto.imagenUrl ? (
            <Image
              src={producto.imagenUrl}
              alt={producto.nombre}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#e8c4cd]">
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

          {/* Botones editar/eliminar — aparecen al hover */}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              title="Editar"
              className="p-1.5 rounded-lg bg-white/90 border border-[#e8c4cd] text-[#7b2d42] hover:bg-[#fdf6f0] hover:text-[#c0607a] shadow-sm transition backdrop-blur-sm"
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
          <p className="font-semibold text-[#3d1a24] text-[14px] leading-tight group-hover:text-[#c0607a] transition">
            {producto.nombre}
          </p>
          {producto.descripcion && (
            <p className="text-[12px] text-[#b07a8a] line-clamp-2">
              {producto.descripcion}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            {producto.permiteMedidaPersonalizada ? (
              <span className="text-[11px] text-[#c0607a] font-medium">
                Medida personalizable
              </span>
            ) : producto.tamanosFijos.length > 0 ? (
              <span className="text-[11px] text-[#c0607a] font-medium">
                {producto.tamanosFijos.length} tamaños
              </span>
            ) : (
              <span className="text-[11px] text-[#b07a8a]">Tamaño único</span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
