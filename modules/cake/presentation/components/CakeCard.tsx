"use client";

import Image from "next/image";
import type { Producto, LineaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_TAG: Record<LineaProducto, { label: string; cls: string }> = {
  sweet:   { label: "Sweet",   cls: "bg-[#DA6C94] text-white" },
  fitness: { label: "Fitness", cls: "bg-[#6ab04c] text-white" },
  healthy: { label: "Healthy", cls: "bg-[#27ae60] text-white" },
};

interface Props {
  producto: Producto;
  onClick: (producto: Producto) => void;
}

export default function CakeCard({ producto, onClick }: Props) {
  const imageSrc = producto.imagenUrl ?? "/img/cake-cafe-sm.webp";
  const tag = LINE_TAG[producto.linea];

  return (
    <div
      className="cursor-pointer group rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-4"
      onClick={() => onClick(producto)}
    >
      <div className="overflow-hidden rounded-2xl relative">
        <Image
          src={imageSrc}
          alt={producto.nombre}
          width={400}
          height={300}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {tag && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tag.cls}`}>
            {tag.label}
          </span>
        )}
      </div>

      <h3 className="text-xl font-semibold mt-4 text-[#DA6C94] group-hover:text-[#c15981] transition-colors line-clamp-2">
        {producto.nombre}
      </h3>

      {producto.descripcion && (
        <p className="text-gray-600 text-sm mt-1 line-clamp-3">
          {producto.descripcion}
        </p>
      )}
    </div>
  );
}
