"use client";
// src/modules/admin/clientes/presentation/components/ClienteCuponesSection.tsx

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useClienteCupones,
  useCuponesDisponibles,
} from "../hooks/useClienteCupones";
import type { Cupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

interface Props {
  clienteId: string;
}

/** Status visual de un cupón asignado a este cliente */
function CuponStatusBadge({ cupon }: { cupon: Cupon }) {
  const now = new Date();

  if (!cupon.activo) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200">
        Inactivo
      </span>
    );
  }
  if (cupon.fechaFin && new Date(cupon.fechaFin) < now) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-red-50 text-red-600 border-red-200">
        Expirado
      </span>
    );
  }
  if (cupon.fechaInicio && new Date(cupon.fechaInicio) > now) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-600 border-blue-200">
        Programado
      </span>
    );
  }
  if (cupon.usosMaximos != null && cupon.usosActuales >= cupon.usosMaximos) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
        Agotado
      </span>
    );
  }
  if (cupon.asignadoCliente?.usado) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-600 border-blue-200">
        Usado
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-green-50 text-green-700 border-green-200">
      Disponible
    </span>
  );
}

export function ClienteCuponesSection({ clienteId }: Props) {
  const { cupones, isLoading, error, actionError, asignar, desasignar } =
    useClienteCupones(clienteId);
  const {
    cupones: disponibles,
    search,
    setSearch,
    isLoading: dispLoading,
  } = useCuponesDisponibles(clienteId);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assignOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setAssignOpen(false);
    }
    const t = setTimeout(
      () => document.addEventListener("mousedown", handleClick),
      50,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [assignOpen]);

  async function handleAsignar(cuponId: string) {
    setAssigning(cuponId);
    try {
      await asignar(cuponId);
      setAssignOpen(false);
      setSearch("");
    } finally {
      setAssigning(null);
    }
  }

  async function handleDesasignar(cuponId: string) {
    setRemoving(cuponId);
    try {
      await desasignar(cuponId);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#7b2d42]">Cupones asignados</h2>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setAssignOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c0607a] text-white text-[13px] font-bold hover:bg-[#a84d66] transition"
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
            Asignar cupón
          </button>

          <AnimatePresence>
            {assignOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#f5dce4] rounded-2xl shadow-xl overflow-hidden z-20"
              >
                <div className="p-3 border-b border-[#f5dce4]">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código…"
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#c0a0a8]"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {dispLoading && (
                    <p className="px-3 py-3 text-[12px] text-[#c0a0a8] text-center">
                      Cargando…
                    </p>
                  )}
                  {!dispLoading && disponibles.length === 0 && (
                    <p className="px-3 py-3 text-[12px] text-[#c0a0a8] text-center">
                      No hay cupones individuales disponibles. Créalos en
                      Cupones con tipo "Individual".
                    </p>
                  )}
                  {!dispLoading &&
                    disponibles.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleAsignar(c.id)}
                        disabled={assigning === c.id}
                        className="w-full text-left px-3 py-2.5 hover:bg-[#fdf6f0] transition border-b border-[#f9eef2] last:border-b-0 disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-bold text-[#3d1a24] tracking-wide">
                            {c.codigo}
                          </p>
                          <span className="text-[12px] font-semibold text-[#c0607a]">
                            {c.tipoDescuento === "porcentaje"
                              ? `${c.valor}%`
                              : `$${c.valor}`}
                          </span>
                        </div>
                        {c.descripcion && (
                          <p className="text-[11px] text-[#b07a8a] mt-0.5">
                            {c.descripcion}
                          </p>
                        )}
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(error || actionError) && (
        <p className="text-sm text-red-600">{error ?? actionError}</p>
      )}

      {!isLoading && cupones.length === 0 && (
        <div className="rounded-2xl border border-[#f5dce4] bg-[#fdf6f0] py-8 text-center text-[#c0a0a8] text-sm">
          Este cliente no tiene cupones individuales asignados
        </div>
      )}

      <div className="flex flex-col gap-2">
        {cupones.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-[#f5dce4] bg-white px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#3d1a24] tracking-wide">
                    {c.codigo}
                  </p>
                  <CuponStatusBadge cupon={c} />
                </div>
                {c.descripcion && (
                  <p className="text-[12px] text-[#b07a8a] mt-0.5">
                    {c.descripcion}
                  </p>
                )}
                <p className="text-[11px] text-[#c0a0a8] mt-0.5">
                  {c.tipoDescuento === "porcentaje"
                    ? `${c.valor}% de descuento`
                    : `$${c.valor} de descuento`}
                  {c.usosMaximos != null
                    ? ` · ${c.usosActuales}/${c.usosMaximos} usos`
                    : ` · ${c.usosActuales} usos`}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDesasignar(c.id)}
              disabled={removing === c.id}
              className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#b07a8a] text-[12px] font-semibold hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-50 transition shrink-0"
            >
              {removing === c.id ? "Quitando…" : "Quitar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
