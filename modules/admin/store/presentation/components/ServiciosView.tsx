"use client";
// src/modules/admin/store/presentation/components/ServiciosView.tsx

import { useState } from "react";
import { PastelConfiguradorModal } from "./configurador/PastelConfiguradorModal";
import { GelatinaCotizadorModal } from "./configurador/GelatinaCotizadorModal";
import { ProductosView } from "./ProductosView";

function SlidersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="17" y2="6" />
      <circle cx="7" cy="6" r="2" fill="currentColor" stroke="none" />
      <line x1="3" y1="14" x2="17" y2="14" />
      <circle cx="13" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ServiciosView() {
  const [search, setSearch] = useState("");
  const [configuradorOpen, setConfiguradorOpen] = useState(false);
  const [gelatinaOpen, setGelatinaOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl border bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0] transition shrink-0">
          <SlidersIcon className="w-4 h-4" />
        </button>
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos o servicios…"
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 placeholder:text-[#c0a0a8]"
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

      {/* Sección: Productos personalizados */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[#7b2d42]">
          Productos personalizados
        </h2>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          {/* Tarjeta Pastel personalizado */}
          <button
            onClick={() => setConfiguradorOpen(true)}
            className="group bg-white rounded-2xl border border-[#f5dce4] overflow-hidden shadow-sm hover:border-[#e8c4cd] hover:shadow-md transition text-left"
          >
            <div className="aspect-square bg-[#fdf6f0] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-[#e8c4cd] group-hover:text-[#dba8b7] transition"
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
            className="group bg-white rounded-2xl border border-[#f5dce4] overflow-hidden shadow-sm hover:border-[#e8c4cd] hover:shadow-md transition text-left"
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
        <h2 className="text-lg font-bold text-[#7b2d42]">Productos</h2>
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
