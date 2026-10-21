"use client";
// src/modules/admin/store/presentation/components/ProduccionView.tsx
//
// Registro de producción por lote (ej. "20 galletas de chocolate") — suma al
// stock del producto. Debajo, tabla de existencias actuales por producto y
// bitácora de producciones recientes. Solo admin.

import { useEffect, useRef, useState } from "react";
import type { ProductoResumen } from "../../domain/entities/Producto.entity";
import { useInventarioStock, useProducciones } from "../hooks/useInventario";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition";

function fmtFecha(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Umbral de "stock bajo" — puramente visual, no bloquea nada. */
const STOCK_BAJO = 5;

export function ProduccionView() {
  // ── Buscador de producto (autocomplete simple, mismo patrón que clientes en CartDrawer) ──
  const [productoSearch, setProductoSearch] = useState("");
  const [productoResults, setProductoResults] = useState<ProductoResumen[]>([]);
  const [productoOpen, setProductoOpen] = useState(false);
  const [productoSel, setProductoSel] = useState<ProductoResumen | null>(null);
  const [productoLoading, setProductoLoading] = useState(false);

  const [cantidad, setCantidad] = useState<number | "">("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const stock = useInventarioStock();
  const producciones = useProducciones();

  useEffect(() => {
    if (!productoOpen) return;
    const q = productoSearch.trim();
    let active = true;
    setProductoLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/productos?search=${encodeURIComponent(q)}&pageSize=8`)
        .then((r) => r.json())
        .then((data) => {
          if (active) setProductoResults(data.data ?? []);
        })
        .catch(() => {
          if (active) setProductoResults([]);
        })
        .finally(() => {
          if (active) setProductoLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [productoSearch, productoOpen]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setProductoOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleRegistrar(e: React.FormEvent) {
    e.preventDefault();
    if (!productoSel || !cantidad || cantidad <= 0) return;
    try {
      await producciones.registrar({
        productoId: productoSel.id,
        cantidad: Number(cantidad),
        fecha,
        notas: notas.trim() || null,
      });
      setSuccessMsg(
        `Producción registrada — ${cantidad} × ${productoSel.nombre}`,
      );
      setProductoSel(null);
      setProductoSearch("");
      setCantidad("");
      setNotas("");
      stock.reload();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      /* el error ya queda en producciones.error */
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Registrar producción ── */}
      <div className="bg-white rounded-2xl border border-hc-line shadow-sm p-5">
        <h2 className="text-sm font-bold text-hc-soft mb-4">
          Registrar producción
        </h2>
        <form onSubmit={handleRegistrar} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-[2fr_1fr_1fr] gap-3">
            {/* Producto */}
            <div ref={ref} className="relative flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                Producto
              </label>
              {productoSel ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-hc-rose bg-hc-hover">
                  <span className="text-sm font-semibold text-hc-ink truncate">
                    {productoSel.nombre}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setProductoSel(null);
                      setProductoSearch("");
                    }}
                    className="text-hc-soft hover:text-red-500 transition shrink-0 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={productoSearch}
                    onChange={(e) => {
                      setProductoSearch(e.target.value);
                      setProductoOpen(true);
                    }}
                    onFocus={() => setProductoOpen(true)}
                    placeholder="Buscar producto…"
                    className={inputCls}
                  />
                  {productoOpen && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-hc-line shadow-lg max-h-56 overflow-y-auto">
                      {productoLoading ? (
                        <p className="px-3 py-3 text-xs text-hc-soft/60">
                          Buscando…
                        </p>
                      ) : productoResults.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-hc-soft/60">
                          Sin resultados
                        </p>
                      ) : (
                        productoResults.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              setProductoSel(p);
                              setProductoOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-hc-ink hover:bg-hc-hover transition"
                          >
                            {p.nombre}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cantidad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                Cantidad producida
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={cantidad}
                onChange={(e) =>
                  setCantidad(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Ej: 20"
                className={inputCls}
              />
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
              Notas <span className="normal-case font-normal">(opcional)</span>
            </label>
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: lote de fin de semana"
              className={inputCls}
            />
          </div>

          {producciones.error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {producciones.error}
            </p>
          )}
          {successMsg && (
            <p className="text-[12px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={!productoSel || !cantidad || producciones.registrando}
            className="self-start px-5 py-2.5 rounded-xl bg-hc-rose text-white text-sm font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
          >
            {producciones.registrando ? "Registrando…" : "Registrar producción"}
          </button>
        </form>
      </div>

      {/* ── Stock actual ── */}
      <div className="bg-white rounded-2xl border border-hc-line shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-hc-soft">Existencias</h2>
          <input
            value={stock.search}
            onChange={(e) => {
              stock.setSearch(e.target.value);
              stock.setPage(1);
            }}
            placeholder="Buscar producto…"
            className={inputCls + " max-w-[220px]"}
          />
        </div>
        {stock.loading ? (
          <p className="text-center text-hc-soft/50 text-sm py-8">
            Cargando…
          </p>
        ) : !stock.data || stock.data.data.length === 0 ? (
          <p className="text-center text-hc-soft/50 text-sm py-8">
            Sin productos registrados
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-hc-sunken">
                  {["Producto", "Línea", "Existencias", "Última producción"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`pb-2.5 text-[10px] font-semibold text-hc-muted/50 uppercase tracking-wider ${
                          i === 2 ? "text-right pr-4" : "text-left pr-3"
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {stock.data.data.map((p) => (
                  <tr
                    key={p.productoId}
                    className="border-b border-hc-sunken last:border-0"
                  >
                    <td className="py-2.5 pr-3 text-hc-ink font-medium">
                      {p.productoNombre}
                    </td>
                    <td className="py-2.5 pr-3 text-hc-muted/70 capitalize">
                      {p.linea}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span
                        className={`font-bold tabular-nums ${
                          p.stockActual < 0
                            ? "text-red-500"
                            : p.stockActual <= STOCK_BAJO
                              ? "text-amber-600"
                              : "text-hc-ink"
                        }`}
                      >
                        {p.stockActual}
                      </span>
                    </td>
                    <td className="py-2.5 text-hc-muted/55">
                      {fmtFecha(p.ultimaProduccion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Producciones recientes ── */}
      <div className="bg-white rounded-2xl border border-hc-line shadow-sm p-5">
        <h2 className="text-sm font-bold text-hc-soft mb-4">
          Producciones recientes
        </h2>
        {producciones.loading ? (
          <p className="text-center text-hc-soft/50 text-sm py-8">
            Cargando…
          </p>
        ) : !producciones.data || producciones.data.data.length === 0 ? (
          <p className="text-center text-hc-soft/50 text-sm py-8">
            Sin producciones registradas todavía
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="border-b border-hc-sunken">
                  {["Fecha", "Producto", "Cantidad", "Notas"].map((h, i) => (
                    <th
                      key={h}
                      className={`pb-2.5 text-[10px] font-semibold text-hc-muted/50 uppercase tracking-wider ${
                        i === 2 ? "text-right pr-4" : "text-left pr-3"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {producciones.data.data.map((p) => (
                  <tr key={p.id} className="border-b border-hc-sunken last:border-0">
                    <td className="py-2.5 pr-3 text-hc-muted/70 whitespace-nowrap">
                      {fmtFecha(p.fecha)}
                    </td>
                    <td className="py-2.5 pr-3 text-hc-ink font-medium">
                      {p.productoNombre}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-bold text-hc-ink tabular-nums">
                      +{p.cantidad}
                    </td>
                    <td className="py-2.5 text-hc-muted/55 truncate max-w-[200px]">
                      {p.notas ?? "—"}
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
