"use client";
// src/modules/admin/store/presentation/components/GastosTab.tsx
//
// Vista de gastos con filtros — compras a proveedores (por categoría/proveedor)
// y costo de producción (insumos) por producto/línea, en el período elegido.

import { useEffect, useState } from "react";
import type { CategoriaCompra } from "../../domain/entities/Finanzas.entity";
import { CATEGORIA_COMPRA_LABELS } from "../../domain/entities/Finanzas.entity";
import type { GastosData } from "@/app/api/admin/finanzas/gastos/route";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
const fmtD = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });

const LINEAS = [
  { value: "", label: "Todas las líneas" },
  { value: "sweet", label: "Sweet" },
  { value: "fitness", label: "Fitness" },
  { value: "healthy", label: "Healthy" },
];

interface Props {
  desde: string;
  hasta: string;
}

export function GastosTab({ desde, hasta }: Props) {
  const [data, setData] = useState<GastosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [linea, setLinea] = useState("");
  const [productoBusqueda, setProductoBusqueda] = useState("");

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ desde, hasta });
    if (categoria) qs.set("categoria", categoria);
    if (proveedor) qs.set("proveedor", proveedor);
    if (linea) qs.set("linea", linea);
    fetch(`/api/admin/finanzas/gastos?${qs}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [desde, hasta, categoria, proveedor, linea]);

  const inputCls =
    "px-3 py-2 rounded-lg border border-[#e8c4a0] bg-white text-sm text-[#3d1a24] focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  const costoPorProductoFiltrado =
    data?.costoPorProducto.filter((p) =>
      p.productoNombre.toLowerCase().includes(productoBusqueda.toLowerCase()),
    ) ?? [];

  if (loading && !data)
    return <p className="text-center text-[#AA6A42]/50 text-sm py-12">Cargando…</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filtros ── */}
      <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-4 flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-semibold text-[#6B3E26]/60 uppercase tracking-wide">
          Filtros
        </span>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={inputCls}
        >
          <option value="">Toda categoría de compra</option>
          {Object.entries(CATEGORIA_COMPRA_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <input
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          placeholder="Proveedor…"
          className={inputCls}
        />
        <select
          value={linea}
          onChange={(e) => setLinea(e.target.value)}
          className={inputCls}
        >
          {LINEAS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        {(categoria || proveedor || linea) && (
          <button
            onClick={() => {
              setCategoria("");
              setProveedor("");
              setLinea("");
            }}
            className="text-[12px] font-semibold text-[#AA6A42] hover:text-red-500 transition"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ── KPIs ── */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-4">
          <p className="text-[11px] font-semibold text-[#6B3E26]/55 uppercase tracking-wide">
            Compras a proveedores
          </p>
          <p className="text-xl font-bold text-[#3A1F14] mt-1">
            {fmt(data.totalCompras)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-4">
          <p className="text-[11px] font-semibold text-[#6B3E26]/55 uppercase tracking-wide">
            Costo de producción (COGS)
          </p>
          <p className="text-xl font-bold text-[#3A1F14] mt-1">
            {fmt(data.totalCostoProduccion)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-4">
          <p className="text-[11px] font-semibold text-[#6B3E26]/55 uppercase tracking-wide">
            Gasto total del período
          </p>
          <p className="text-xl font-bold text-[#c0607a] mt-1">
            {fmt(data.totalCompras + data.totalCostoProduccion)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* ── Compras por categoría ── */}
        <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#AA6A42] mb-4">
            Compras por categoría
          </h3>
          {data.porCategoriaCompra.length === 0 ? (
            <p className="text-center text-[#AA6A42]/50 text-sm py-8">
              Sin compras en este período
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.porCategoriaCompra
                .sort((a, b) => b.total - a.total)
                .map((c) => {
                  const pct =
                    data.totalCompras > 0 ? (c.total / data.totalCompras) * 100 : 0;
                  return (
                    <div key={c.categoria}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#6B3E26]/70 capitalize">
                          {CATEGORIA_COMPRA_LABELS[c.categoria as CategoriaCompra] ??
                            c.categoria}
                        </span>
                        <span className="font-semibold text-[#3A1F14]">
                          {fmt(c.total)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#f5e8db] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#c0607a]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ── Costo por línea ── */}
        <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#AA6A42] mb-4">
            Costo de producción por línea
          </h3>
          {data.costoPorLinea.length === 0 ? (
            <p className="text-center text-[#AA6A42]/50 text-sm py-8">
              Sin ventas de catálogo en este período
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.costoPorLinea.map((l) => {
                const pct =
                  data.totalCostoProduccion > 0
                    ? (l.costoTotal / data.totalCostoProduccion) * 100
                    : 0;
                return (
                  <div key={l.linea}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#6B3E26]/70 capitalize">{l.linea}</span>
                      <span className="font-semibold text-[#3A1F14]">
                        {fmt(l.costoTotal)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f5e8db] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Costo por producto ── */}
      <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#AA6A42]">
            Costo de producción por producto
          </h3>
          <input
            value={productoBusqueda}
            onChange={(e) => setProductoBusqueda(e.target.value)}
            placeholder="Buscar producto…"
            className={inputCls + " max-w-[200px]"}
          />
        </div>
        {costoPorProductoFiltrado.length === 0 ? (
          <p className="text-center text-[#AA6A42]/50 text-sm py-8">
            Sin resultados
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="border-b border-[#f5e8db]">
                  {["Producto", "Unidades vendidas", "Costo total"].map((h, i) => (
                    <th
                      key={h}
                      className={`pb-2.5 text-[10px] font-semibold text-[#6B3E26]/50 uppercase tracking-wider ${
                        i > 0 ? "text-right pr-4" : "text-left pr-3"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costoPorProductoFiltrado.map((p) => (
                  <tr key={p.productoId} className="border-b border-[#f5e8db] last:border-0">
                    <td className="py-2.5 pr-3 text-[#3A1F14] font-medium">
                      {p.productoNombre}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-[#6B3E26]/70 tabular-nums">
                      {p.cantidadVendida}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-bold text-[#3A1F14] tabular-nums">
                      {fmt(p.costoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detalle de compras ── */}
      <div className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#AA6A42] mb-4">
          Compras del período{categoria || proveedor ? " (filtradas)" : ""}
        </h3>
        {data.compras.length === 0 ? (
          <p className="text-center text-[#AA6A42]/50 text-sm py-8">
            Sin compras que coincidan con los filtros
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-[#f5e8db]">
                  {["Fecha", "Concepto", "Proveedor", "Categoría", "Monto"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`pb-2.5 text-[10px] font-semibold text-[#6B3E26]/50 uppercase tracking-wider ${
                          i === 4 ? "text-right pr-4" : "text-left pr-3"
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.compras.map((c) => (
                  <tr key={c.id} className="border-b border-[#f5e8db] last:border-0">
                    <td className="py-2.5 pr-3 text-[#6B3E26]/70 whitespace-nowrap">
                      {fmtD(c.fecha)}
                    </td>
                    <td className="py-2.5 pr-3 text-[#3A1F14]">{c.concepto}</td>
                    <td className="py-2.5 pr-3 text-[#6B3E26]/70">
                      {c.proveedor ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      {c.categoria ? CATEGORIA_COMPRA_LABELS[c.categoria] : "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-[#3A1F14] tabular-nums">
                      {fmt(c.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
