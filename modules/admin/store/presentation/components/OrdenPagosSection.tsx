"use client";

import { useState, useEffect, useCallback } from "react";

interface OrdenPago {
  id: string;
  fecha: string;
  monto: number;
  createdAt: string;
}

interface Props {
  ordenId: string;
  ordenTotal: number;
  status: string;
}

const hoy = () => new Date().toISOString().slice(0, 10);

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrdenPagosSection({ ordenId, ordenTotal, status }: Props) {
  const [pagos, setPagos]       = useState<OrdenPago[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fecha, setFecha]       = useState(hoy());
  const [monto, setMonto]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errMsg, setErrMsg]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ordenes/${ordenId}/pagos`);
      if (res.ok) setPagos(await res.json());
    } finally {
      setLoading(false);
    }
  }, [ordenId]);

  useEffect(() => { load(); }, [load]);

  // No mostrar para cotizaciones
  if (status === "cotizacion") return null;

  const totalPagado   = pagos.reduce((s, p) => s + p.monto, 0);
  const saldo         = ordenTotal - totalPagado;
  const pct           = ordenTotal > 0 ? Math.min((totalPagado / ordenTotal) * 100, 100) : 0;
  const liquidado     = saldo <= 0.01;

  async function handleAdd() {
    const m = parseFloat(monto.replace(",", "."));
    if (!m || m <= 0) { setErrMsg("Ingresa un monto válido"); return; }
    if (!fecha)        { setErrMsg("Selecciona una fecha"); return; }
    setSaving(true);
    setErrMsg(null);
    try {
      const res = await fetch(`/api/admin/ordenes/${ordenId}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, monto: m }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? "Error al guardar");
      }
      setShowForm(false);
      setMonto("");
      setFecha(hoy());
      await load();
    } catch (e: any) {
      setErrMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await fetch(`/api/admin/ordenes/${ordenId}/pagos/${id}`, { method: "DELETE" });
      setConfirmId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#f5dce4] bg-[#fdf6f0] px-3.5 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
          Pagos
        </p>
        {liquidado && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            LIQUIDADO
          </span>
        )}
      </div>

      {/* Resumen de saldo */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#b07a8a]">Total de la orden</span>
          <span className="font-semibold text-[#3d1a24]">
            ${ordenTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#b07a8a]">Pagado</span>
          <span className="font-semibold text-emerald-600">
            ${totalPagado.toFixed(2)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-white rounded-full overflow-hidden border border-[#f5dce4]">
          <div
            className="h-full rounded-full transition-all duration-500 bg-emerald-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#b07a8a]">Pendiente</span>
          <span
            className={`font-bold ${
              liquidado ? "text-emerald-600" : "text-[#c0607a]"
            }`}
          >
            {liquidado ? "$0.00" : `$${saldo.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Lista de pagos */}
      {loading ? (
        <p className="text-[11px] text-[#b07a8a]">Cargando…</p>
      ) : pagos.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
            Historial
          </p>
          {pagos.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white border border-[#f5dce4] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#3d1a24] tabular-nums">
                    ${p.monto.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-[#b07a8a]">{fmtDate(p.fecha)}</p>
                </div>
              </div>

              {confirmId === p.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#b07a8a]">¿Eliminar?</span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting}
                    className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-0.5 rounded-md border border-[#e8c4cd] text-[#b07a8a] text-[10px] hover:bg-[#f5dce4] transition"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(p.id)}
                  className="p-1 rounded-md hover:bg-red-50 text-[#c0a0a8] hover:text-red-500 transition"
                  aria-label="Eliminar pago"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-[#c0a0a8] text-center py-1">
          Sin pagos registrados
        </p>
      )}

      {/* Formulario de nuevo pago */}
      {showForm ? (
        <div className="flex flex-col gap-2 rounded-lg border border-[#e8c4cd] bg-white px-3 py-3">
          <p className="text-[10px] font-semibold text-[#7b2d42] uppercase tracking-wider mb-0.5">
            Registrar pago
          </p>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#b07a8a] font-medium">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="text-[12px] border border-[#e8c4cd] rounded-lg px-2.5 py-1.5 text-[#3d1a24] focus:outline-none focus:border-[#c0607a] bg-white"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-[#b07a8a] font-medium">Monto ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="text-[12px] border border-[#e8c4cd] rounded-lg px-2.5 py-1.5 text-[#3d1a24] focus:outline-none focus:border-[#c0607a] bg-white tabular-nums"
              />
            </div>
          </div>
          {errMsg && (
            <p className="text-[11px] text-red-500">{errMsg}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-1.5 rounded-lg bg-[#c0607a] text-white text-[12px] font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
            >
              {saving ? "Guardando…" : "Guardar pago"}
            </button>
            <button
              onClick={() => { setShowForm(false); setMonto(""); setErrMsg(null); }}
              className="px-3 py-1.5 rounded-lg border border-[#e8c4cd] text-[#b07a8a] text-[12px] hover:bg-[#f5dce4] transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        !liquidado && (
          <button
            onClick={() => { setShowForm(true); setErrMsg(null); }}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#e8c4cd] text-[#c0607a] text-[12px] font-semibold hover:bg-white/60 transition"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Registrar pago
          </button>
        )
      )}
    </div>
  );
}
