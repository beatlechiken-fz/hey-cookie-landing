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
        <p className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
          Resumen de costos
        </p>
        <span className="text-[11px] text-[#6B3E26]">
          Factor volumen: {factorVolumen.toFixed(4)}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-[#f0e0d0] bg-[#FFF7F0] py-8 text-center text-[#AA6A42] text-sm">
          Selecciona las opciones del pastel para ver el desglose de costos
        </div>
      ) : (
        <div className="rounded-xl border border-[#f0e0d0] overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FFF7F0] border-b border-[#f0e0d0]">
                <th className="px-3 py-2 text-left  text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Costo base
                </th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Factor
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Costo final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9eef2]">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-[#3d1a24] text-[13px]">
                      {item.concepto}
                    </p>
                    {item.detalle && (
                      <p className="text-[11px] text-[#6B3E26]">
                        {item.detalle}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-[#AA6A42]/70">
                    ${item.costoBase.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center text-[#6B3E26]">
                    {item.factorAplicado === 1
                      ? "fijo"
                      : item.factorAplicado.toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-[#AA6A42]">
                    ${item.costoFinal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#FFF7F0]/60 border-t border-[#f0e0d0]">
                <td
                  colSpan={3}
                  className="px-3 py-1.5 text-right text-[11px] font-semibold text-[#6B3E26] uppercase tracking-wider"
                >
                  Costo de insumos
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-[#AA6A42]">
                  ${costoInsumos.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Cargos adicionales */}
      {cargosAdicionales.length > 0 && (
        <div className="rounded-xl border border-[#f0e0d0] overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FFF7F0] border-b border-[#f0e0d0]">
                <th className="px-3 py-2 text-left  text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Cargo adicional
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Base
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9eef2]">
              {cargosAdicionales.map((c, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-[#3d1a24] text-[13px]">
                      {c.concepto}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-right text-[#AA6A42]/70">
                    ${c.base.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-[#AA6A42]">
                    ${c.monto.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#FFF7F0] border-t border-[#f0e0d0]">
                <td
                  colSpan={2}
                  className="px-3 py-2 text-right text-[11px] font-semibold text-[#6B3E26] uppercase tracking-wider"
                >
                  Costo de producción (× {cantidad})
                </td>
                <td className="px-3 py-2 text-right font-bold text-[#AA6A42]">
                  ${costoFinal.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Precio final destacado */}
      <div className="rounded-2xl bg-gradient-to-br from-[#c0607a] to-[#AA6A42] px-5 py-4 flex items-center justify-between">
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
