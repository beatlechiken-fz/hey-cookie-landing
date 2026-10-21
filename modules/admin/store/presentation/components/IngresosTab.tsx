"use client";
// src/modules/admin/finanzas/presentation/components/IngresosTab.tsx

import { useState } from "react";
import { useRegistros } from "../hooks/useFinanzas";
import type { FinanzasFiltros } from "@/core/helpers/finanzasFiltros";
import type {
  FinanzasRegistro,
  UpdateFinanzasRegistroDTO,
} from "../../domain/entities/Finanzas.entity";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    n,
  );
const fmtD = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

interface Props {
  desde: string;
  hasta: string;
  filtros?: FinanzasFiltros;
}

export function IngresosTab({ desde, hasta, filtros }: Props) {
  const { registros, isLoading, error, update, remove } = useRegistros(
    desde,
    hasta,
    filtros,
  );

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateFinanzasRegistroDTO>({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalVentas = registros.reduce((s, r) => s + r.totalVenta, 0);
  const totalInsumos = registros.reduce((s, r) => s + r.insumos, 0);
  const totalServ = registros.reduce((s, r) => s + r.servicios, 0);
  const totalMO = registros.reduce((s, r) => s + r.manoDeObra, 0);
  const totalUtil = registros.reduce((s, r) => s + r.utilidad, 0);
  const totalComision = registros.reduce((s, r) => s + (r.comision ?? 0), 0);

  function openEdit(r: FinanzasRegistro) {
    setEditId(r.id);
    setEditForm({
      totalVenta: r.totalVenta,
      insumos: r.insumos,
      servicios: r.servicios,
      manoDeObra: r.manoDeObra,
      utilidad: r.utilidad,
      comision: r.comision,
      notas: r.notas,
    });
    setEditError(null);
  }

  async function handleSave() {
    if (!editId) return;
    setSaving(true);
    setEditError(null);
    try {
      await update(editId, editForm);
      setEditId(null);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-2 py-1 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-sm focus:outline-none focus:border-hc-rose transition text-right";

  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <p className="text-center text-hc-soft text-sm py-8">
          Cargando registros…
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && registros.length === 0 && (
        <div className="rounded-2xl border border-hc-line bg-hc-hover py-12 text-center">
          <p className="text-hc-soft text-sm">
            Sin ventas registradas en el período
          </p>
          <p className="text-[11px] text-hc-soft mt-1">
            Los registros se crean automáticamente al marcar una orden como{" "}
            <strong>Pagado</strong>
          </p>
        </div>
      )}

      {registros.length > 0 && (
        <div className="rounded-2xl border border-hc-line overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hc-hover border-b border-hc-line">
                {[
                  "Fecha",
                  "Orden",
                  "Cliente",
                  "Venta",
                  "Insumos",
                  "Servicios",
                  "Mano obra",
                  "Utilidad",
                  "Comisión",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-semibold text-hc-muted uppercase tracking-wider text-right first:text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-line">
              {registros.map((r) =>
                editId === r.id ? (
                  // ── Fila de edición ─────────────────────────────────────
                  <tr key={r.id} className="bg-hc-hover">
                    <td className="px-3 py-2" colSpan={3}>
                      <div className="font-medium text-hc-ink text-[13px]">
                        {fmtD(r.fechaVenta)}
                      </div>
                      <div className="text-[11px] text-hc-muted">
                        #{r.ordenNumero} · {r.clienteNombre ?? "Sin cliente"}
                      </div>
                      {editError && (
                        <p className="text-[11px] text-red-600 mt-1">
                          {editError}
                        </p>
                      )}
                    </td>
                    {(
                      [
                        "totalVenta",
                        "insumos",
                        "servicios",
                        "manoDeObra",
                        "utilidad",
                      ] as const
                    ).map((f) => (
                      <td key={f} className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm[f] ?? ""}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              [f]: Number(e.target.value),
                            }))
                          }
                          className={inputCls}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.comision ?? ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            comision:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          }))
                        }
                        placeholder="Sin comisión"
                        className={inputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-2 py-1 rounded-lg bg-hc-rose text-white text-[11px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
                        >
                          {saving ? "…" : "✓"}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-2 py-1 rounded-lg border border-hc-line-strong text-hc-muted text-[11px] hover:bg-hc-hover transition"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // ── Fila normal ──────────────────────────────────────────
                  <tr key={r.id} className="hover:bg-hc-rose-tint transition">
                    <td className="px-3 py-2.5">
                      <p className="text-hc-ink font-medium text-[13px]">
                        {fmtD(r.fechaVenta)}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-hc-muted text-[12px]">
                        #{r.ordenNumero ?? "—"}
                      </span>
                      {r.finanzas && (
                        <span
                          className="ml-1.5 px-1.5 py-0.5 rounded bg-hc-rose-tint text-hc-rose text-[10px] font-bold uppercase"
                          title="Venta marcada para finanzas"
                        >
                          Fin
                        </span>
                      )}
                      {r.parcial && (
                        <span
                          className="ml-1 px-1.5 py-0.5 rounded bg-[#FFF3D6] text-hc-soft text-[10px] font-bold uppercase"
                          title="Montos de los productos que coinciden con el filtro, no de toda la venta"
                        >
                          Parcial
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-hc-ink text-[13px] truncate max-w-[120px]">
                        {r.clienteNombre ?? "—"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-hc-soft">
                      {fmt(r.totalVenta)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-hc-ink">
                      {fmt(r.insumos)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-hc-ink">
                      {fmt(r.servicios)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-hc-ink">
                      {fmt(r.manoDeObra)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-green-700">
                      {fmt(r.utilidad)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {r.comision != null ? (
                        <span className="text-orange-600 font-semibold">
                          {fmt(r.comision)}
                        </span>
                      ) : (
                        <span className="text-hc-soft text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openEdit(r)}
                          disabled={r.parcial}
                          className="p-1.5 rounded-lg hover:bg-hc-hover text-hc-muted hover:text-hc-rose transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            r.parcial
                              ? "Quita el filtro de tipo/línea para editar la venta completa"
                              : "Editar — ajustar comisión u otros campos"
                          }
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleting(r.id)}
                          disabled={r.parcial}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-hc-soft hover:text-red-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
            {/* Totales */}
            <tfoot>
              <tr className="bg-hc-hover border-t-2 border-hc-line">
                <td
                  colSpan={3}
                  className="px-3 py-2.5 text-[11px] font-bold text-hc-muted uppercase tracking-wider"
                >
                  TOTALES ({registros.length} ventas)
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-hc-soft">
                  {fmt(totalVentas)}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-hc-ink">
                  {fmt(totalInsumos)}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-hc-ink">
                  {fmt(totalServ)}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-hc-ink">
                  {fmt(totalMO)}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-green-700">
                  {fmt(totalUtil)}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-orange-600">
                  {totalComision > 0 ? fmt(totalComision) : "—"}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Confirmar eliminación */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-hc-cacao/25 backdrop-blur-[2px]"
            onClick={() => setDeleting(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line p-6 max-w-sm w-full z-10">
            <p className="font-bold text-hc-ink mb-2">
              ¿Eliminar este registro?
            </p>
            <p className="text-[13px] text-hc-muted mb-5">
              Esta acción es permanente y no puede deshacerse.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl border border-hc-line-strong text-hc-muted text-sm font-semibold hover:bg-hc-hover transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => remove(deleting).then(() => setDeleting(null))}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
