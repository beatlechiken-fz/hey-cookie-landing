"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DashboardData } from "@/app/api/admin/dashboard/route";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt = (n: number) => Math.round(n).toLocaleString("es-MX");
const fmtMXN = (n: number) => `$${fmt(n)}`;
const calcDelta = (cur: number, prev: number): number | null =>
  prev === 0 ? null : ((cur - prev) / prev) * 100;

/* ── Config ───────────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; color: string; badge: string }> = {
  cotizacion:     { label: "Cotización",   color: "#94a3b8", badge: "bg-slate-100 text-slate-600"    },
  en_proceso:     { label: "En proceso",   color: "#f59e0b", badge: "bg-amber-100 text-amber-700"    },
  listo_entregar: { label: "Por entregar", color: "#8b5cf6", badge: "bg-violet-100 text-violet-700"  },
  pagado:         { label: "Pagado",       color: "#10b981", badge: "bg-emerald-100 text-emerald-700"},
  entregado:      { label: "Entregado",    color: "#3b82f6", badge: "bg-blue-100 text-blue-700"      },
  cancelado:      { label: "Cancelado",    color: "#ef4444", badge: "bg-red-100 text-red-500"        },
};

const DESGLOSE_CFG = [
  { key: "insumos",    label: "Insumos",      color: "#ef4444" },
  { key: "manoDeObra", label: "Mano de obra", color: "#f59e0b" },
  { key: "servicios",  label: "Servicios",    color: "#6366f1" },
  { key: "utilidad",   label: "Utilidad",     color: "#10b981" },
  { key: "comision",   label: "Comisión",     color: "#8b5cf6" },
] as const;

/* ── Sub-components ───────────────────────────────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#f0e4d4] animate-pulse rounded-2xl ${className}`} />;
}

function KPICard({
  title,
  value,
  delta,
  subtext,
  colorClass,
  icon,
}: {
  title: string;
  value: string;
  delta?: number | null;
  subtext?: string;
  colorClass: string;
  icon: ReactNode;
}) {
  const hasDelta = delta !== null && delta !== undefined;
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#6B3E26]/55 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#231512] mt-1 leading-none tabular-nums">
            {value}
          </p>
          {hasDelta && (
            <span
              className={`inline-flex items-center gap-0.5 mt-2 text-[11px] font-semibold ${
                delta! >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {delta! >= 0 ? "▲" : "▼"} {Math.abs(delta!).toFixed(0)}% vs mes ant.
            </span>
          )}
          {subtext && !hasDelta && (
            <p className="text-[11px] text-[#6B3E26]/50 mt-2">{subtext}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
        cfg?.badge ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {cfg?.label ?? status}
    </span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label + "T12:00:00");
  return (
    <div className="bg-white border border-[#f0e0d0] rounded-xl shadow-lg px-3.5 py-2.5 text-xs">
      <p className="font-semibold text-[#3A1F14] mb-1.5">
        {d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.stroke }}
          />
          <span className="text-[#6B3E26]/70">{p.name}:</span>
          <span className="font-semibold text-[#231512]">{fmtMXN(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-20 pb-16 pt-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-64" />
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function AdminDashboard() {
  const locale = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const goto = (path: string) => `/${locale}${path}`;

  const mesLabel = new Date().toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-[#AA6A42]/60 text-sm">
        Error al cargar el panel. Recarga la página.
      </div>
    );
  }

  const { kpi, ordenesPorEstado, ordenesRecientes, ventasPorDia, desgloseFinanciero } = data;

  const deltaVentas = calcDelta(kpi.ventasMes, kpi.ventasMesAnterior);
  const deltaUtilidad = calcDelta(kpi.utilidadMes, kpi.utilidadMesAnterior);
  const totalOrdenes = ordenesPorEstado.reduce((s, o) => s + o.count, 0);
  const desgloseTotal = (Object.values(desgloseFinanciero) as number[]).reduce(
    (s, v) => s + v,
    0,
  );

  const xTickFmt = (d: string) => {
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  };

  const yTickFmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

  return (
    <div className="px-4 sm:px-6 lg:px-20 pb-16">
      <div className="max-w-7xl mx-auto pt-6">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-[#7b2d42]">Panel de control</h1>
            <p className="text-sm text-[#6B3E26]/55 mt-0.5 capitalize">{mesLabel}</p>
          </div>
          <a
            href={goto("/admin/dashboard/store/ordenes")}
            className="text-xs font-semibold text-[#AA6A42] hover:text-[#8B5635] transition hidden sm:block"
          >
            Ver todas las órdenes →
          </a>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <KPICard
            title="Ventas del mes"
            value={fmtMXN(kpi.ventasMes)}
            delta={deltaVentas}
            colorClass="bg-[#DA6C94]/10"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#DA6C94]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <KPICard
            title="Utilidad neta"
            value={fmtMXN(kpi.utilidadMes)}
            delta={deltaUtilidad}
            colorClass="bg-emerald-50"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            }
          />
          <KPICard
            title="Clientes"
            value={fmt(kpi.totalClientes)}
            subtext={`${kpi.totalProductos} productos activos`}
            colorClass="bg-violet-50"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <KPICard
            title="Órdenes activas"
            value={fmt(kpi.ordenesActivas)}
            subtext={`de ${totalOrdenes} totales`}
            colorClass="bg-amber-50"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
          />
        </div>

        {/* ── Gráfica + Pipeline ── */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">

          {/* Area chart: ventas 30 días */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-[#231512]">Ventas — últimos 30 días</h2>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6B3E26]/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DA6C94]" />
                  Ventas
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6B3E26]/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Utilidad
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={ventasPorDia} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#DA6C94" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#DA6C94" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gradUtilidad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5e8db" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 10, fill: "#AA6A42" }}
                  tickFormatter={xTickFmt}
                  interval={6}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#AA6A42" }}
                  tickFormatter={yTickFmt}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="#DA6C94"
                  strokeWidth={2.5}
                  fill="url(#gradVentas)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#DA6C94", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="utilidad"
                  name="Utilidad"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradUtilidad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline donut */}
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 flex flex-col">
            <h2 className="text-sm font-bold text-[#231512] mb-4">Pipeline de órdenes</h2>
            {ordenesPorEstado.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[#AA6A42]/40 text-sm">
                Sin órdenes registradas
              </div>
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={ordenesPorEstado}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {ordenesPorEstado.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_CFG[entry.status]?.color ?? "#ccc"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-[#231512]">{totalOrdenes}</span>
                    <span className="text-[10px] text-[#6B3E26]/50 font-medium">órdenes</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2 flex-1">
                  {ordenesPorEstado.map((o) => (
                    <div key={o.status} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: STATUS_CFG[o.status]?.color }}
                        />
                        <span className="text-[#6B3E26]/70 truncate">
                          {STATUS_CFG[o.status]?.label ?? o.status}
                        </span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-bold text-[#231512]">{o.count}</span>
                        <span className="text-[#6B3E26]/40 text-[10px]">{fmtMXN(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Órdenes recientes + Desglose + Quick links ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Tabla órdenes recientes */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#231512]">Órdenes recientes</h2>
              <a
                href={goto("/admin/dashboard/store/ordenes")}
                className="text-[11px] font-semibold text-[#AA6A42] hover:text-[#8B5635] transition"
              >
                Ver todas →
              </a>
            </div>
            {ordenesRecientes.length === 0 ? (
              <p className="text-sm text-[#AA6A42]/50 text-center py-8">Sin órdenes todavía</p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs min-w-[420px]">
                  <thead>
                    <tr className="border-b border-[#f5e8db]">
                      {["#", "Cliente", "Estado", "Total", "Entrega"].map((h, i) => (
                        <th
                          key={h}
                          className={`pb-2.5 text-[#6B3E26]/50 font-semibold ${
                            i === 3 ? "text-right pr-4" : "text-left pr-3"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesRecientes.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-[#f5e8db] last:border-0 hover:bg-[#FAF3E0]/80 transition-colors"
                      >
                        <td className="py-3 pr-3 font-mono text-[#AA6A42] font-bold">
                          #{o.numero}
                        </td>
                        <td className="py-3 pr-3 text-[#231512] max-w-[130px] truncate">
                          {o.clienteNombre ?? <span className="text-[#6B3E26]/40">—</span>}
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-[#231512] tabular-nums">
                          {fmtMXN(o.total)}
                        </td>
                        <td className="py-3 text-[#6B3E26]/55">
                          {o.fechaEntrega
                            ? new Date(o.fechaEntrega + "T12:00:00").toLocaleDateString(
                                "es-MX",
                                { day: "numeric", month: "short" },
                              )
                            : <span className="text-[#6B3E26]/30">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Desglose financiero + accesos rápidos */}
          <div className="space-y-4">

            {/* Desglose */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#231512]">Desglose del mes</h2>
                <a
                  href={goto("/admin/dashboard/store/finanzas")}
                  className="text-[11px] font-semibold text-[#AA6A42] hover:text-[#8B5635] transition"
                >
                  Finanzas →
                </a>
              </div>
              {desgloseTotal === 0 ? (
                <p className="text-xs text-[#AA6A42]/50 text-center py-4">
                  Sin registros este mes
                </p>
              ) : (
                <div className="space-y-3.5">
                  {DESGLOSE_CFG.map(({ key, label, color }) => {
                    const value =
                      desgloseFinanciero[key as keyof typeof desgloseFinanciero];
                    const pct = desgloseTotal > 0 ? (value / desgloseTotal) * 100 : 0;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="flex items-center gap-1.5 text-[#6B3E26]/70">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: color }}
                            />
                            {label}
                          </span>
                          <span className="font-semibold text-[#231512] tabular-nums">
                            {fmtMXN(value)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#f5e8db] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-1 border-t border-[#f5e8db] flex items-center justify-between text-xs">
                    <span className="text-[#6B3E26]/50 font-medium">Total registrado</span>
                    <span className="font-bold text-[#231512] tabular-nums">
                      {fmtMXN(kpi.ventasMes)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
              <h2 className="text-sm font-bold text-[#231512] mb-3">Accesos rápidos</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Órdenes",
                    path: "/admin/dashboard/store/ordenes",
                    colorClass: "bg-amber-50 hover:bg-amber-100 text-amber-700",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    ),
                  },
                  {
                    label: "Finanzas",
                    path: "/admin/dashboard/store/finanzas",
                    colorClass: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    ),
                  },
                  {
                    label: "Clientes",
                    path: "/admin/dashboard/store/clientes",
                    colorClass: "bg-violet-50 hover:bg-violet-100 text-violet-700",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                  },
                  {
                    label: "Insumos",
                    path: "/admin/dashboard/raws/insumos",
                    colorClass: "bg-blue-50 hover:bg-blue-100 text-blue-700",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                      </svg>
                    ),
                  },
                ].map(({ label, path, colorClass, icon }) => (
                  <a
                    key={path}
                    href={goto(path)}
                    className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-xs font-semibold transition-colors ${colorClass}`}
                  >
                    {icon}
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
