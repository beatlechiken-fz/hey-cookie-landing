"use client";

import { useEffect, useState } from "react";
import {
  CASHBACK_PORCENTAJE,
  ETIQUETA_MOVIMIENTO,
  type MovimientoCashback,
} from "@/modules/admin/store/domain/entities/Cashback.entity";

interface CuponCliente {
  codigo: string;
  descripcion: string | null;
  tipoDescuento: "porcentaje" | "monto_fijo";
  valor: number;
  fechaFin: string | null;
}

interface Beneficios {
  cashback: { saldo: number; movimientos: MovimientoCashback[] };
  cupones: CuponCliente[];
  comprasRealizadas: number;
}

const dinero = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return `$${Number.isInteger(r) ? r.toFixed(0) : r.toFixed(2)}`;
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

/** Saldo de cashback, sus movimientos y los cupones vigentes del cliente. */
export function MisBeneficios() {
  const [data, setData] = useState<Beneficios | null>(null);
  const [verMovimientos, setVerMovimientos] = useState(false);

  useEffect(() => {
    fetch("/api/club/beneficios")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => null);
  }, []);

  if (!data) {
    return <div className="bg-white rounded-2xl border border-[#f0e0d0] h-28 animate-pulse mb-6" />;
  }

  const { cashback, cupones, comprasRealizadas } = data;
  const movimientos = verMovimientos ? cashback.movimientos : cashback.movimientos.slice(0, 3);

  return (
    <section className="mb-8" aria-labelledby="mis-beneficios">
      <h2 id="mis-beneficios" className="text-lg font-bold text-[#3A1F14] mb-4">Mis beneficios</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Compras */}
        <div className="bg-white rounded-2xl border border-[#f0e0d0] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#AA6A42]">Mis compras</p>
          <p className="text-3xl font-bold text-[#7b2d42] mt-1">{comprasRealizadas}</p>
          <p className="text-xs text-[#AA6A42]/70 font-sans mt-1">
            {comprasRealizadas === 0
              ? "Haz tu primera compra pagada para empezar a sumar."
              : `Pedido${comprasRealizadas !== 1 ? "s" : ""} pagado${comprasRealizadas !== 1 ? "s" : ""} con Hey Cookie.`}
          </p>
        </div>

        {/* Cashback */}
        <div className="bg-white rounded-2xl border border-[#f0e0d0] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#AA6A42]">Mi cashback</p>
          <p className="text-3xl font-bold text-[#27ae60] mt-1">{dinero(Math.max(0, cashback.saldo))}</p>
          <p className="text-xs text-[#AA6A42]/70 font-sans mt-1">
            Ganas el {Math.round(CASHBACK_PORCENTAJE * 100)}% de cada compra pagada. Úsalo como descuento desde tu carrito.
          </p>

          {cashback.movimientos.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-[#f9eef2] font-sans">
              {movimientos.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block text-[13px] text-[#3A1F14] truncate">
                      {ETIQUETA_MOVIMIENTO[m.tipo]}
                      {m.ordenNumero != null && ` · #${m.ordenNumero}`}
                    </span>
                    <span className="block text-[11px] text-[#AA6A42]/60">{fecha(m.createdAt)}</span>
                  </span>
                  <span className={`text-[13px] font-semibold tabular-nums ${m.monto >= 0 ? "text-[#27ae60]" : "text-[#7b2d42]"}`}>
                    {m.monto >= 0 ? "+" : "−"}{dinero(Math.abs(m.monto))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {cashback.movimientos.length > 3 && (
            <button
              type="button"
              onClick={() => setVerMovimientos((v) => !v)}
              className="mt-2 text-xs text-[#AA6A42] hover:underline font-sans cursor-pointer"
            >
              {verMovimientos ? "Ver menos" : `Ver los ${cashback.movimientos.length} movimientos`}
            </button>
          )}
        </div>

        {/* Cupones */}
        <div className="bg-white rounded-2xl border border-[#f0e0d0] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#AA6A42]">Mis cupones</p>
          {cupones.length === 0 ? (
            <p className="text-sm text-[#AA6A42]/70 font-sans mt-3">Por ahora no tienes cupones disponibles.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {cupones.map((c) => (
                <li key={c.codigo} className="rounded-xl border border-dashed border-[#e8c4a0] bg-[#fdf6f0] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-[#7b2d42] tracking-wider">{c.codigo}</span>
                    <span className="text-sm font-bold text-[#27ae60]">
                      {c.tipoDescuento === "porcentaje" ? `${c.valor}%` : dinero(c.valor)}
                    </span>
                  </div>
                  {c.descripcion && <p className="text-xs text-[#6B3E26] font-sans mt-0.5">{c.descripcion}</p>}
                  {c.fechaFin && (
                    <p className="text-[11px] text-[#AA6A42]/60 font-sans mt-0.5">Válido hasta el {fecha(c.fechaFin)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-[#AA6A42]/70 font-sans mt-3">Escribe el código en tu carrito para aplicarlo.</p>
        </div>
      </div>
    </section>
  );
}
