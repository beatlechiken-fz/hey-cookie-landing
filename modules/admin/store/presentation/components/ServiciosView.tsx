"use client";
// src/modules/admin/store/presentation/components/ServiciosView.tsx

import { useState } from "react";
import { PastelConfiguradorModal } from "./configurador/PastelConfiguradorModal";
import { GelatinaCotizadorModal } from "./configurador/GelatinaCotizadorModal";
import { ProductosView } from "./ProductosView";

export function ServiciosView() {
  const [configuradorOpen, setConfiguradorOpen] = useState(false);
  const [gelatinaOpen, setGelatinaOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Sección: Productos personalizados */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[#AA6A42]">
          Productos personalizados
        </h2>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          {/* Tarjeta Pastel personalizado */}
          <button
            onClick={() => setConfiguradorOpen(true)}
            className="group bg-white rounded-2xl border border-[#f0e0d0] overflow-hidden shadow-sm hover:border-[#e8c4a0] hover:shadow-md transition text-left"
          >
            <div className="aspect-square bg-[#FFF7F0] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-[#e8c4a0] group-hover:text-[#dba8b7] transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 2 1 3.5S9 11 9 11h6s-1-2-1-2.5S15 6.5 15 5a3 3 0 0 0-3-3z" />
                <path d="M4 11h16l-1 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2l-1-9z" />
                <path d="M4 15h16M4 19h16" opacity="0.4" />
              </svg>
            </div>
            <div className="p-3 flex flex-col items-center gap-2">
              <p className="font-semibold text-[#3d1a24] text-[13px] text-center leading-tight">
                Pastel personalizado
              </p>
              <span className="w-full text-center py-2 rounded-xl bg-[#c0607a] text-white text-[12px] font-bold group-hover:bg-[#a84d66] transition">
                Configurar
              </span>
            </div>
          </button>

          {/* Tarjeta Gelatina personalizada */}
          <button
            onClick={() => setGelatinaOpen(true)}
            className="group bg-white rounded-2xl border border-[#f0e0d0] overflow-hidden shadow-sm hover:border-[#e8c4a0] hover:shadow-md transition text-left"
          >
            <div className="aspect-square bg-[#f0f9fd] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-[#a8d8e8] group-hover:text-[#7bc0d8] transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2h8l1 4H7L8 2z" />
                <path d="M6 6c0 0-1 2-1 5s1 8 7 9c6-1 7-6 7-9s-1-5-1-5" />
                <path d="M8 11c0 0 1 2 4 2s4-2 4-2" opacity="0.5" />
                <circle cx="9" cy="8" r="1" fill="currentColor" opacity="0.4" />
                <circle
                  cx="15"
                  cy="9"
                  r="1"
                  fill="currentColor"
                  opacity="0.4"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="0.8"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="p-3 flex flex-col items-center gap-2">
              <p className="font-semibold text-[#3d1a24] text-[13px] text-center leading-tight">
                Gelatina personalizada
              </p>
              <span className="w-full text-center py-2 rounded-xl bg-[#5badd0] text-white text-[12px] font-bold group-hover:bg-[#4090b0] transition">
                Configurar
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Sección: Productos */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[#AA6A42]">Productos</h2>
        <ProductosView />
      </div>

      <PastelConfiguradorModal
        open={configuradorOpen}
        onClose={() => setConfiguradorOpen(false)}
      />
      <GelatinaCotizadorModal
        open={gelatinaOpen}
        onClose={() => setGelatinaOpen(false)}
      />
    </div>
  );
}
