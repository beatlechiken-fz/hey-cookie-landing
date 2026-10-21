"use client";
// src/modules/admin/store/presentation/components/FinanzasFiltrosBar.tsx
//
// Filtros de los dashboards de finanzas: ventas marcadas / sin marcar,
// tipo de producto y línea. Se combinan entre sí.

import {
  FILTROS_VACIOS,
  LINEAS_PRODUCTO,
  TIPOS_PRODUCTO,
  hayFiltroProducto,
  hayFiltros,
  type FinanzasFiltros,
  type FiltroFinanzas,
  type TipoProducto,
} from "@/core/helpers/finanzasFiltros";
import type { LineaProducto } from "../../domain/entities/Producto.entity";

interface Props {
  filtros: FinanzasFiltros;
  onChange: (f: FinanzasFiltros) => void;
  /** Muestra el aviso de que compras/movimientos manuales no se filtran. */
  avisoCompras?: boolean;
}

const selectCls =
  "px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-sm text-hc-ink focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition";

export function FinanzasFiltrosBar({ filtros, onChange, avisoCompras }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-hc-line shadow-sm p-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-semibold text-hc-muted/60 uppercase tracking-wide">
          Filtrar ventas
        </span>
        <select
          aria-label="Ventas marcadas para finanzas"
          value={filtros.finanzas}
          onChange={(e) =>
            onChange({ ...filtros, finanzas: e.target.value as FiltroFinanzas })
          }
          className={selectCls}
        >
          <option value="todas">Todas las ventas</option>
          <option value="si">Solo marcadas Finanzas</option>
          <option value="no">Sin marcar</option>
        </select>
        <select
          aria-label="Tipo de producto"
          value={filtros.tipo ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              tipo: (e.target.value || undefined) as TipoProducto | undefined,
            })
          }
          className={selectCls}
        >
          <option value="">Todos los tipos</option>
          {TIPOS_PRODUCTO.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Línea de producto"
          value={filtros.linea ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              linea: (e.target.value || undefined) as LineaProducto | undefined,
            })
          }
          className={selectCls}
        >
          <option value="">Todas las líneas</option>
          {LINEAS_PRODUCTO.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        {hayFiltros(filtros) && (
          <button
            onClick={() => onChange(FILTROS_VACIOS)}
            className="text-[12px] font-semibold text-hc-soft hover:text-red-500 transition"
          >
            Limpiar
          </button>
        )}
      </div>
      {avisoCompras && hayFiltros(filtros) && (
        <p className="text-[11px] text-hc-muted/70">
          Compras a proveedores y movimientos manuales no tienen producto ni
          marca de finanzas, así que no se filtran.
          {hayFiltroProducto(filtros) &&
            " Con tipo o línea, cada venta cuenta solo la parte de los productos que coinciden."}
        </p>
      )}
    </div>
  );
}
