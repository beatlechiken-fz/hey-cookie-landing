"use client";
// src/modules/admin/store/presentation/components/ServiciosView.tsx

import { useRef, useState } from "react";
import { PastelConfiguradorModal } from "./configurador/PastelConfiguradorModal";
import { GelatinaCotizadorModal } from "./configurador/GelatinaCotizadorModal";
import { PersonalizadoConfiguradorModal } from "./configurador/PersonalizadoConfiguradorModal";
import { ProductosView, type ProductosViewHandle } from "./ProductosView";
import type { CreateProductoDTO } from "../../domain/entities/Producto.entity";

type Personalizado = "pastel" | "gelatina" | "armado";

// Cada configurador en su tarjeta pastel tenue, con el botón en el tono
// oscuro de esa misma tarjeta.
const PERSONALIZADOS: { key: Personalizado; titulo: string; fondo: string; boton: string }[] = [
  {
    key: "pastel",
    titulo: "Pastel personalizado",
    fondo: "bg-[#FCF1F4]",
    boton: "bg-[#A84D66] hover:bg-[#933F57] shadow-[0_2px_8px_-2px_rgba(168,77,102,0.45)]",
  },
  {
    key: "gelatina",
    titulo: "Gelatina personalizada",
    fondo: "bg-[#EFF6EF]",
    boton: "bg-[#5E8566] hover:bg-[#4D7055] shadow-[0_2px_8px_-2px_rgba(94,133,102,0.45)]",
  },
  {
    key: "armado",
    titulo: "Armado personalizado",
    fondo: "bg-[#FDF3EC]",
    boton: "bg-[#AA6A42] hover:bg-[#935A37] shadow-[0_2px_8px_-2px_rgba(170,106,66,0.45)]",
  },
];

export function ServiciosView() {
  const [configuradorOpen, setConfiguradorOpen] = useState(false);
  const [gelatinaOpen, setGelatinaOpen] = useState(false);
  const [personalizadoOpen, setPersonalizadoOpen] = useState(false);
  const productosRef = useRef<ProductosViewHandle>(null);

  function abrir(tipo: Personalizado) {
    if (tipo === "pastel") setConfiguradorOpen(true);
    else if (tipo === "gelatina") setGelatinaOpen(true);
    else setPersonalizadoOpen(true);
  }

  // "Guardar como producto" desde un configurador: crea el producto y abre su
  // editor en ProductosView; el configurador se cierra solo al terminar.
  async function guardarComoProducto(dto: CreateProductoDTO) {
    if (!productosRef.current) throw new Error("El listado de productos no está listo");
    await productosRef.current.crearYEditar(dto);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Sección: Productos personalizados */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-hc-soft">
          Productos personalizados
        </h2>

        <div className="flex flex-wrap gap-3">
          {PERSONALIZADOS.map((t) => (
            <div
              key={t.key}
              className={`flex w-[196px] flex-col items-center gap-3 rounded-2xl px-4 pb-4 pt-5 text-center ${t.fondo}`}
            >
              <p className="text-[14px] font-bold leading-tight text-hc-ink">{t.titulo}</p>
              <button
                type="button"
                onClick={() => abrir(t.key)}
                className={`w-full rounded-full py-2 text-[13px] font-semibold text-white transition active:scale-[0.98] ${t.boton}`}
              >
                Configurar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sección: Productos */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-hc-soft">Productos</h2>
        <ProductosView ref={productosRef} />
      </div>

      <PastelConfiguradorModal
        open={configuradorOpen}
        onClose={() => setConfiguradorOpen(false)}
        onGuardarComoProducto={guardarComoProducto}
      />
      <GelatinaCotizadorModal
        open={gelatinaOpen}
        onClose={() => setGelatinaOpen(false)}
        onGuardarComoProducto={guardarComoProducto}
      />
      <PersonalizadoConfiguradorModal
        open={personalizadoOpen}
        onClose={() => setPersonalizadoOpen(false)}
      />
    </div>
  );
}
