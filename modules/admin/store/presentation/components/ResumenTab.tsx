"use client";
// src/modules/admin/finanzas/presentation/components/ResumenTab.tsx

import { useState } from "react";
import { useResumen, useMovimientos } from "../hooks/useFinanzas";
import type {
  CuentaMovimiento,
  TipoMovimiento,
  CreateMovimientoDTO,
} from "../../domain/entities/Finanzas.entity";
import { CUENTA_LABELS } from "../../domain/entities/Finanzas.entity";

const CUENTAS_MOVIBLES: CuentaMovimiento[] = [
  "utilidad",
  "mano_de_obra",
  "servicios",
  "comision",
  "general",
];

const CUENTA_ICONS: Record<string, string> = {
  utilidad: "💎",
  mano_de_obra: "👐",
  servicios: "⚙️",
  comision: "🤝",
  insumos: "🧂",
  general: "💼",
};

const CUENTA_COLORS: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  utilidad: {
    bg: "#f0fdf4",
    border: "#86efac",
    text: "#166534",
    badge: "bg-green-100 text-green-700",
  },
  mano_de_obra: {
    bg: "#eff6ff",
    border: "#93c5fd",
    text: "#1e40af",
    badge: "bg-blue-100 text-blue-700",
  },
  servicios: {
    bg: "#fdf4ff",
    border: "#d8b4fe",
    text: "#6b21a8",
    badge: "bg-purple-100 text-purple-700",
  },
  comision: {
    bg: "#fff7ed",
    border: "#fdba74",
    text: "#9a3412",
    badge: "bg-orange-100 text-orange-700",
  },
  insumos: {
    bg: "#fdf6f0",
    border: "#f5dce4",
    text: "#7b2d42",
    badge: "bg-pink-100 text-pink-700",
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    n,
  );

interface Props {
  desde: string;
  hasta: string;
}

export function ResumenTab({ desde, hasta }: Props) {
  const { resumen, isLoading, error, reload } = useResumen(desde, hasta);
  const {
    movimientos,
    create: createMov,
    remove: removeMov,
  } = useMovimientos(desde, hasta);

  // Modal de nuevo movimiento
  const [showMov, setShowMov] = useState(false);
  const [movForm, setMovForm] = useState<CreateMovimientoDTO>({
    tipo: "egreso",
    cuenta: "utilidad",
    concepto: "",
    monto: 0,
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [savingMov, setSavingMov] = useState(false);
  const [movError, setMovError] = useState<string | null>(null);

  async function handleSaveMov() {
    if (!movForm.concepto.trim()) {
      setMovError("El concepto es requerido");
      return;
    }
    if (!movForm.monto || movForm.monto <= 0) {
      setMovError("El monto debe ser mayor a 0");
      return;
    }
    setSavingMov(true);
    setMovError(null);
    try {
      await createMov(movForm);
      setShowMov(false);
      setMovForm({
        tipo: "egreso",
        cuenta: "utilidad",
        concepto: "",
        monto: 0,
        fecha: new Date().toISOString().slice(0, 10),
      });
      reload();
    } catch (e: any) {
      setMovError(e.message);
    } finally {
      setSavingMov(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  return (
    <div className="flex flex-col gap-6">
      {isLoading && (
        <p className="text-center text-[#c0a0a8] text-sm py-8">
          Calculando resumen…
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {resumen && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total ventas",
                value: resumen.totalVentas,
                icon: "🏷️",
                color: "text-[#7b2d42]",
              },
              {
                label: "Total compras",
                value: resumen.totalCompras,
                icon: "🛒",
                color: "text-red-600",
              },
              {
                label: "Nro. de ventas",
                value: null,
                icon: "📋",
                color: "text-[#7b2d42]",
              },
              {
                label: "Utilidad neta",
                value: resumen.saldoNeto,
                icon: "💎",
                color: "text-green-700",
              },
            ].map((kpi, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#f5dce4] p-4 flex flex-col gap-1"
              >
                <span className="text-[11px] text-[#b07a8a] font-semibold uppercase tracking-wider">
                  {kpi.icon} {kpi.label}
                </span>
                <span className={`text-xl font-bold ${kpi.color}`}>
                  {kpi.value != null
                    ? fmt(kpi.value)
                    : `${resumen.cuentas.length > 0 ? "—" : "0"}`}
                </span>
              </div>
            ))}
          </div>

          {/* Cuentas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-[#7b2d42] uppercase tracking-wider">
                Cuentas
              </h3>
              <button
                onClick={() => setShowMov(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7b2d42] text-white text-[12px] font-bold hover:bg-[#5a1e2e] transition"
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
                Registrar movimiento
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resumen.cuentas.map((cuenta) => {
                const c =
                  CUENTA_COLORS[cuenta.clave as string] ??
                  CUENTA_COLORS.insumos;
                const mov = movimientos.filter(
                  (m) => m.cuenta === cuenta.clave,
                );
                return (
                  <div
                    key={cuenta.clave}
                    style={{
                      background: c.bg,
                      border: `1.5px solid ${c.border}`,
                    }}
                    className="rounded-2xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {CUENTA_ICONS[cuenta.clave as string] ?? "💼"}
                        </span>
                        <span
                          className="font-bold text-[14px]"
                          style={{ color: c.text }}
                        >
                          {cuenta.nombre}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}
                      >
                        {fmt(cuenta.saldo)}
                      </span>
                    </div>

                    <div
                      className="flex flex-col gap-1 text-[12px]"
                      style={{ color: c.text + "99" }}
                    >
                      <div className="flex justify-between">
                        <span>Ventas acumuladas</span>
                        <span className="font-semibold">
                          {fmt(cuenta.acumulado)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Movimientos netos</span>
                        <span
                          className={`font-semibold ${cuenta.movimientosNetos >= 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          {cuenta.movimientosNetos >= 0 ? "+" : ""}
                          {fmt(cuenta.movimientosNetos)}
                        </span>
                      </div>
                    </div>

                    {/* Últimos movimientos de esta cuenta */}
                    {mov.length > 0 && (
                      <div
                        className="flex flex-col gap-1 border-t pt-2"
                        style={{ borderColor: c.border }}
                      >
                        {mov.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-1">
                              <span>{m.tipo === "egreso" ? "↓" : "↑"}</span>
                              <span
                                className="truncate max-w-[120px]"
                                title={m.concepto}
                              >
                                {m.concepto}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`font-semibold ${m.tipo === "egreso" ? "text-red-500" : "text-green-600"}`}
                              >
                                {m.tipo === "egreso" ? "-" : "+"}
                                {fmt(m.monto)}
                              </span>
                              <button
                                onClick={() => removeMov(m.id).then(reload)}
                                className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimas ventas */}
          <div>
            <h3 className="text-[13px] font-bold text-[#7b2d42] uppercase tracking-wider mb-3">
              Últimas ventas registradas
            </h3>
            {resumen.cuentas.length === 0 ? (
              <p className="text-sm text-[#c0a0a8]">Sin ventas en el período</p>
            ) : (
              <p className="text-sm text-[#b07a8a]">
                Ve a la pestaña Ingresos para el detalle completo.
              </p>
            )}
          </div>
        </>
      )}

      {/* Modal nuevo movimiento */}
      {showMov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowMov(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#f5dce4] p-6 max-w-md w-full z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#7b2d42] text-lg">
                Nuevo movimiento
              </h3>
              <button
                onClick={() => setShowMov(false)}
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

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Tipo
              </label>
              <div className="flex gap-2">
                {(["egreso", "ingreso"] as TipoMovimiento[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMovForm((f) => ({ ...f, tipo: t }))}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-semibold border transition ${
                      movForm.tipo === t
                        ? t === "egreso"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-green-600 text-white border-green-600"
                        : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"
                    }`}
                  >
                    {t === "egreso" ? "↓ Egreso (pago)" : "↑ Ingreso (entrada)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuenta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Cuenta
              </label>
              <select
                value={movForm.cuenta}
                onChange={(e) =>
                  setMovForm((f) => ({
                    ...f,
                    cuenta: e.target.value as CuentaMovimiento,
                  }))
                }
                className={inputCls}
              >
                {CUENTAS_MOVIBLES.map((c) => (
                  <option key={c} value={c}>
                    {CUENTA_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            {/* Concepto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Concepto *
              </label>
              <input
                value={movForm.concepto}
                onChange={(e) =>
                  setMovForm((f) => ({ ...f, concepto: e.target.value }))
                }
                placeholder="Ej: Pago de mano de obra semana 23"
                className={inputCls}
              />
            </div>

            {/* Monto */}
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
                  value={movForm.monto || ""}
                  onChange={(e) =>
                    setMovForm((f) => ({ ...f, monto: Number(e.target.value) }))
                  }
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                value={movForm.fecha}
                onChange={(e) =>
                  setMovForm((f) => ({ ...f, fecha: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Notas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                Notas (opcional)
              </label>
              <textarea
                rows={2}
                value={movForm.notas ?? ""}
                onChange={(e) =>
                  setMovForm((f) => ({ ...f, notas: e.target.value || null }))
                }
                className={inputCls + " resize-none"}
              />
            </div>

            {movError && <p className="text-sm text-red-600">{movError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setShowMov(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMov}
                disabled={savingMov}
                className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
              >
                {savingMov ? "Guardando…" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
