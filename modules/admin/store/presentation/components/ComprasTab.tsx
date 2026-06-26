"use client";
// src/modules/admin/finanzas/presentation/components/ComprasTab.tsx

import { useState } from "react";
import { useCompras } from "../hooks/useFinanzas";
import type {
  FinanzasCompra,
  CreateCompraDTO,
  CategoriaCompra,
} from "../../domain/entities/Finanzas.entity";
import { CATEGORIA_COMPRA_LABELS } from "../../domain/entities/Finanzas.entity";

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

const CAT_COLORS: Record<CategoriaCompra, string> = {
  ingredientes: "bg-pink-100 text-pink-700",
  empaques: "bg-blue-100 text-blue-700",
  equipo: "bg-purple-100 text-purple-700",
  servicios: "bg-orange-100 text-orange-700",
  otros: "bg-gray-100 text-gray-700",
};

const EMPTY: CreateCompraDTO = {
  fecha: new Date().toISOString().slice(0, 10),
  concepto: "",
  proveedor: "",
  categoria: null,
  monto: 0,
  notas: "",
};

interface Props {
  desde: string;
  hasta: string;
}

export function ComprasTab({ desde, hasta }: Props) {
  const { compras, isLoading, error, create, update, remove } = useCompras(
    desde,
    hasta,
  );

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCompraDTO>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalCompras = compras.reduce((s, c) => s + c.monto, 0);

  function openCreate() {
    setForm(EMPTY);
    setEditId(null);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(c: FinanzasCompra) {
    setForm({
      fecha: c.fecha,
      concepto: c.concepto,
      proveedor: c.proveedor ?? "",
      categoria: c.categoria,
      monto: c.monto,
      notas: c.notas ?? "",
    });
    setEditId(c.id);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.concepto.trim()) {
      setFormError("El concepto es requerido");
      return;
    }
    if (!form.monto || form.monto <= 0) {
      setFormError("El monto debe ser mayor a 0");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const dto: CreateCompraDTO = {
        ...form,
        proveedor: form.proveedor?.trim() || null,
        notas: form.notas?.trim() || null,
      };
      if (editId) await update(editId, dto);
      else await create(dto);
      setShowForm(false);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#c0a0a8]";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {totalCompras > 0 && (
          <p className="text-[13px] text-[#b07a8a]">
            Total en período:{" "}
            <strong className="text-red-600">{fmt(totalCompras)}</strong>
          </p>
        )}
        <button
          onClick={openCreate}
          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#7b2d42] text-white text-[12px] font-bold hover:bg-[#5a1e2e] transition"
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
          Nueva compra
        </button>
      </div>

      {isLoading && (
        <p className="text-center text-[#c0a0a8] text-sm py-8">
          Cargando compras…
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && compras.length === 0 && (
        <div className="rounded-2xl border border-[#f5dce4] bg-[#fdf6f0] py-12 text-center">
          <p className="text-[#c0a0a8] text-sm">
            Sin compras registradas en el período
          </p>
        </div>
      )}

      {compras.length > 0 && (
        <div className="rounded-2xl border border-[#f5dce4] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fdf6f0] border-b border-[#f5dce4]">
                {[
                  "Fecha",
                  "Concepto",
                  "Proveedor",
                  "Categoría",
                  "Monto",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider text-left last:w-16"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9eef2]">
              {compras.map((c) => (
                <tr key={c.id} className="hover:bg-[#fdf9fb] transition">
                  <td className="px-3 py-2.5 text-[#3d1a24] text-[13px] whitespace-nowrap">
                    {fmtD(c.fecha)}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-[#3d1a24] font-medium text-[13px]">
                      {c.concepto}
                    </p>
                    {c.notas && (
                      <p className="text-[11px] text-[#b07a8a] truncate max-w-[200px]">
                        {c.notas}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[#3d1a24] text-[13px]">
                    {c.proveedor ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {c.categoria ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CAT_COLORS[c.categoria]}`}
                      >
                        {CATEGORIA_COMPRA_LABELS[c.categoria]}
                      </span>
                    ) : (
                      <span className="text-[#c0a0a8]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-bold text-red-600 whitespace-nowrap">
                    {fmt(c.monto)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg hover:bg-[#fdf6f0] text-[#b07a8a] hover:text-[#c0607a] transition"
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
                        onClick={() => setDeleting(c.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#c0a0a8] hover:text-red-500 transition"
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#fdf6f0] border-t-2 border-[#f5dce4]">
                <td
                  colSpan={4}
                  className="px-3 py-2.5 text-[11px] font-bold text-[#b07a8a] uppercase tracking-wider"
                >
                  TOTAL ({compras.length} compras)
                </td>
                <td className="px-3 py-2.5 font-bold text-red-600">
                  {fmt(totalCompras)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modal crear/editar compra */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#f5dce4] p-6 max-w-md w-full z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#7b2d42] text-lg">
                {editId ? "Editar compra" : "Nueva compra"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Concepto *
              </label>
              <input
                value={form.concepto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, concepto: e.target.value }))
                }
                placeholder="Ej: Compra de mantequilla y harina"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                  Proveedor
                </label>
                <input
                  value={form.proveedor ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, proveedor: e.target.value }))
                  }
                  placeholder="Nombre del proveedor"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                  Categoría
                </label>
                <select
                  value={form.categoria ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      categoria: (e.target.value ||
                        null) as CategoriaCompra | null,
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">Sin categoría</option>
                  {Object.entries(CATEGORIA_COMPRA_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Monto *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[#b07a8a]">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.monto || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, monto: Number(e.target.value) }))
                  }
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Notas
              </label>
              <textarea
                rows={2}
                value={form.notas ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notas: e.target.value }))
                }
                className={inputCls + " resize-none"}
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
              >
                {saving
                  ? "Guardando…"
                  : editId
                    ? "Guardar cambios"
                    : "Registrar compra"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setDeleting(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#f5dce4] p-6 max-w-sm w-full z-10">
            <p className="font-bold text-[#3d1a24] mb-2">
              ¿Eliminar esta compra?
            </p>
            <p className="text-[13px] text-[#b07a8a] mb-5">
              Esta acción es permanente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
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
