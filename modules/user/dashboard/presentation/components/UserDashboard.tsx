"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { buildOrdenClienteHtml } from "@/core/helpers/generarPDF";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface OrdenItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Orden {
  id: string;
  numero: number;
  status: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  clienteNombre: string;
  fechaEntrega: string | null;
  direccionEntrega: string | null;
  createdAt: string;
  items: OrdenItem[];
}

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; cls: string }> = {
  cotizacion:     { label: "Cotización",           cls: "bg-blue-50 text-blue-700 border-blue-200" },
  en_proceso:     { label: "En proceso",           cls: "bg-amber-50 text-amber-700 border-amber-200" },
  listo_entregar: { label: "Listo para entregar",  cls: "bg-purple-50 text-purple-700 border-purple-200" },
  pagado:         { label: "Pagado",               cls: "bg-green-50 text-green-700 border-green-200" },
  entregado:      { label: "Entregado",            cls: "bg-teal-50 text-teal-700 border-teal-200" },
  cancelado:      { label: "Cancelado",            cls: "bg-red-50 text-red-600 border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-gray-50 text-gray-600 border-gray-200" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── PDF ──────────────────────────────────────────────────────────────────────

function downloadOrdenPDF(orden: Orden) {
  const html = buildOrdenClienteHtml({
    tipo: orden.status === "cotizacion" ? "cotizacion" : "orden",
    numero: orden.numero,
    clienteNombre: orden.clienteNombre,
    fechaCreacion: orden.createdAt,
    fechaEntrega: orden.fechaEntrega,
    direccionEntrega: orden.direccionEntrega,
    items: orden.items.map((i) => ({
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      subtotal: i.subtotal,
    })),
    subtotal: orden.subtotal,
    descuentoTotal: orden.descuentoTotal,
    total: orden.total,
  });
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  setTimeout(() => { win?.print(); URL.revokeObjectURL(url); }, 600);
}

// ── Tarjeta de orden ─────────────────────────────────────────────────────────

function OrdenCard({ orden }: { orden: Orden }) {
  const [expanded, setExpanded] = useState(false);

  const fecha = new Date(orden.createdAt).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-[0_2px_8px_rgba(170,106,66,0.06)] overflow-hidden">
      {/* Row principal */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#fdf6f0] border border-[#f0e0d0] shrink-0">
          <span className="text-[10px] text-[#b07a8a] font-sans leading-none">Orden</span>
          <span className="text-base font-bold text-[#7b2d42] leading-tight">#{orden.numero}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={orden.status} />
            <span className="text-[11px] text-[#AA6A42]/60 font-sans">{fecha}</span>
          </div>
          <p className="text-[13px] text-[#6B3E26]/70 font-sans mt-0.5 truncate">
            {orden.items.length === 1
              ? orden.items[0].nombre
              : `${orden.items[0].nombre} +${orden.items.length - 1} más`}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-base font-bold text-[#3A1F14]">${orden.total.toFixed(0)}</p>
          {orden.descuentoTotal > 0 && (
            <p className="text-[11px] text-[#27ae60] font-sans">-${orden.descuentoTotal.toFixed(0)}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2 px-5 pb-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8c4a0] text-[#AA6A42] text-xs font-semibold hover:bg-[#FFF0E6] transition-colors cursor-pointer font-sans"
        >
          <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {expanded ? "Ocultar detalle" : "Ver detalle"}
        </button>
        <button
          onClick={() => downloadOrdenPDF(orden)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#AA6A42] hover:bg-[#8a5535] text-white text-xs font-semibold transition-colors cursor-pointer font-sans"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar PDF
        </button>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="border-t border-[#f0e0d0] px-5 py-4 bg-[#fdf9f5]">
          <table className="w-full text-[13px] font-sans">
            <thead>
              <tr className="border-b border-[#f0e0d0]">
                <th className="pb-2 text-left text-[11px] text-[#b07a8a] font-semibold uppercase tracking-wider">Producto</th>
                <th className="pb-2 text-center text-[11px] text-[#b07a8a] font-semibold uppercase tracking-wider">Cant.</th>
                <th className="pb-2 text-right text-[11px] text-[#b07a8a] font-semibold uppercase tracking-wider">Precio</th>
                <th className="pb-2 text-right text-[11px] text-[#b07a8a] font-semibold uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {orden.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 text-[#3A1F14]">{item.nombre}</td>
                  <td className="py-2 text-center text-[#AA6A42]">{item.cantidad}</td>
                  <td className="py-2 text-right text-[#3A1F14]">${item.precioUnitario.toFixed(0)}</td>
                  <td className="py-2 text-right font-semibold text-[#3A1F14]">${item.subtotal.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col items-end gap-1 mt-3 pt-3 border-t border-[#f0e0d0] font-sans text-[13px]">
            <div className="flex gap-8 text-[#AA6A42]">
              <span>Subtotal</span><span>${orden.subtotal.toFixed(0)}</span>
            </div>
            {orden.descuentoTotal > 0 && (
              <div className="flex gap-8 text-[#27ae60]">
                <span>Descuento</span><span>-${orden.descuentoTotal.toFixed(0)}</span>
              </div>
            )}
            <div className="flex gap-8 font-bold text-[15px] text-[#3A1F14]">
              <span>Total</span><span>${orden.total.toFixed(0)}</span>
            </div>
          </div>
          {(orden.fechaEntrega || orden.direccionEntrega) && (
            <div className="mt-3 flex flex-col gap-1">
              {orden.fechaEntrega && (
                <p className="text-[12px] text-[#AA6A42] font-sans">
                  📅 Entrega: {new Date(orden.fechaEntrega).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              {orden.direccionEntrega && (
                <p className="text-[12px] text-[#AA6A42] font-sans">
                  📍 Domicilio: {orden.direccionEntrega}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function UserDashboard() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/ordenes")
      .then((r) => r.json())
      .then((d) => setOrdenes(d.ordenes ?? []))
      .catch(() => setError("No se pudieron cargar tus pedidos"))
      .finally(() => setLoading(false));
  }, []);

  const nombre = session?.user?.name?.split(" ")[0] ?? "Cliente";

  const stats = {
    total: ordenes.length,
    activas: ordenes.filter((o) => ["cotizacion", "en_proceso", "listo_entregar"].includes(o.status)).length,
    entregadas: ordenes.filter((o) => o.status === "entregado").length,
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0e0d0]">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-title text-[#7b2d42]">¡Hola, {nombre}! 👋</h1>
              <p className="text-sm text-[#AA6A42]/70 font-sans mt-0.5">Aquí están tus pedidos de Hey Cookie</p>
            </div>
            <a
              href={`/${locale}`}
              className="flex items-center gap-1.5 text-sm text-[#AA6A42] hover:text-[#7b2d42] transition font-sans"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Ir a la tienda
            </a>
          </div>

          {/* Stats */}
          {!loading && ordenes.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Pedidos totales", value: stats.total, color: "text-[#7b2d42]" },
                { label: "En curso", value: stats.activas, color: "text-[#AA6A42]" },
                { label: "Entregados", value: stats.entregadas, color: "text-[#27ae60]" },
              ].map((s) => (
                <div key={s.label} className="bg-[#fdf6f0] rounded-xl p-3 text-center border border-[#f0e0d0]">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[#AA6A42]/60 font-sans mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Órdenes */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#3A1F14]">Mis pedidos</h2>
          <a
            href={`/${locale}/user/perfil`}
            className="text-xs text-[#AA6A42] hover:underline font-sans flex items-center gap-1"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Mi perfil
          </a>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#f0e0d0] h-24 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-6">{error}</p>
        )}

        {!loading && !error && ordenes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#fdf6f0] border border-[#f0e0d0] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#e8c4a0]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#3A1F14]">Aún no tienes pedidos</p>
              <p className="text-sm text-[#AA6A42]/60 font-sans mt-1">Explora nuestras galletas y pasteles para hacer tu primer pedido</p>
            </div>
            <a
              href={`/${locale}`}
              className="px-5 py-2.5 rounded-xl bg-[#AA6A42] hover:bg-[#8a5535] text-white text-sm font-bold transition-colors font-sans"
            >
              Ver productos
            </a>
          </div>
        )}

        {!loading && !error && ordenes.length > 0 && (
          <div className="flex flex-col gap-4">
            {ordenes.map((orden) => (
              <OrdenCard key={orden.id} orden={orden} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
