"use client";

import Image from "next/image";
import type { Producto, LineaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_TAG: Record<LineaProducto, { label: string; cls: string }> = {
  sweet:   { label: "Sweet",   cls: "bg-[#A84D66] text-white" },
  fitness: { label: "Fitness", cls: "bg-[#4A7B35] text-white" },
  healthy: { label: "Healthy", cls: "bg-[#1B7A43] text-white" },
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
      role="button"
      tabIndex={0}
      onClick={() => onClick(producto)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(producto);
        }
      }}
      className="cursor-pointer group rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AA6A42] focus-visible:outline-offset-2 transition-all duration-300 p-4"
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
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tag.cls}`}>
            {tag.label}
          </span>
        )}
      </div>

      <h3 className="text-xl font-semibold mt-4 text-[#A8386A] group-hover:text-[#8f2f56] transition-colors line-clamp-2">
        {producto.nombre}
      </h3>

      {producto.descripcion && (
        <p className="text-[#6B3E26] text-sm mt-1 line-clamp-3">
          {producto.descripcion}
        </p>
      )}
    </div>
  );
}
