"use client";
// src/modules/admin/store/presentation/components/configurador/CostoDesgloseTable.tsx

import type { PastelCostoDesglose } from "../../../domain/entities/PastelPersonalizado.entity";

interface Props {
  desglose: PastelCostoDesglose;
  cantidad: number;
}

export function CostoDesgloseTable({ desglose, cantidad }: Props) {
  const {
    factorVolumen,
    items,
    costoInsumos,
    cargosAdicionales,
    costoProduccionTotal,
    precioSugerido,
  } = desglose;
  const precioFinal = precioSugerido * cantidad;
  const costoFinal = costoProduccionTotal * cantidad;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
          Resumen de costos
        </p>
        <span className="text-[11px] text-hc-muted">
          Factor volumen: {factorVolumen.toFixed(4)}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-hc-line bg-hc-hover py-8 text-center text-hc-soft text-sm">
          Selecciona las opciones del pastel para ver el desglose de costos
        </div>
      ) : (
        <div className="rounded-xl border border-hc-line overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hc-hover border-b border-hc-line">
                <th className="px-3 py-2 text-left  text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Costo base
                </th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Factor
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Costo final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-line">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-hc-ink text-[13px]">
                      {item.concepto}
                    </p>
                    {item.detalle && (
                      <p className="text-[11px] text-hc-muted">
                        {item.detalle}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-hc-soft/70">
                    ${item.costoBase.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center text-hc-muted">
                    {item.factorAplicado === 1
                      ? "fijo"
                      : item.factorAplicado.toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-hc-soft">
                    ${item.costoFinal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-hc-hover/60 border-t border-hc-line">
                <td
                  colSpan={3}
                  className="px-3 py-1.5 text-right text-[11px] font-semibold text-hc-muted uppercase tracking-wider"
                >
                  Costo de insumos
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-hc-soft">
                  ${costoInsumos.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Cargos adicionales */}
      {cargosAdicionales.length > 0 && (
        <div className="rounded-xl border border-hc-line overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hc-hover border-b border-hc-line">
                <th className="px-3 py-2 text-left  text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Cargo adicional
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Base
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-line">
              {cargosAdicionales.map((c, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-hc-ink text-[13px]">
                      {c.concepto}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-right text-hc-soft/70">
                    ${c.base.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-hc-soft">
                    ${c.monto.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-hc-hover border-t border-hc-line">
                <td
                  colSpan={2}
                  className="px-3 py-2 text-right text-[11px] font-semibold text-hc-muted uppercase tracking-wider"
                >
                  Costo de producción (× {cantidad})
                </td>
                <td className="px-3 py-2 text-right font-bold text-hc-soft">
                  ${costoFinal.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Precio final destacado */}
      <div className="rounded-2xl bg-gradient-to-br from-hc-rose to-hc-soft px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
            Precio sugerido
          </p>
          <p className="text-[11px] text-white/60 mt-0.5">
            Costo de producción{cantidad > 1 ? ` · ${cantidad} unidades` : ""}
          </p>
        </div>
        <p className="text-3xl font-bold text-white">
          ${precioFinal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
