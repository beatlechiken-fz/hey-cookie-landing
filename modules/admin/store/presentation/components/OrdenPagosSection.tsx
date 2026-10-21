"use client";

import { useState, useEffect, useCallback } from "react";
import {
  participantesActivos,
  repartirMonto,
  type PastelCompartido,
} from "../../domain/entities/PastelCompartido.entity";

interface OrdenPago {
  id: string;
  fecha: string;
  monto: number;
  observaciones: string | null;
  participanteId: string | null;
  createdAt: string;
}

/** Pastel compartido de la orden y el monto total que se reparte entre sus participantes. */
export interface PagoCompartido {
  compartido: PastelCompartido;
  monto: number;
}

interface Props {
  ordenId: string;
  ordenTotal: number;
  status: string;
  /** Si la orden tiene pasteles para compartir, un pago precargado por participante. */
  compartidos?: PagoCompartido[];
}

const hoy = () => new Date().toISOString().slice(0, 10);

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrdenPagosSection({ ordenId, ordenTotal, status, compartidos = [] }: Props) {
  const [pagos, setPagos]       = useState<OrdenPago[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fecha, setFecha]       = useState(hoy());
  const [monto, setMonto]       = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving]     = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const [confirmPartId, setConfirmPartId] = useState<string | null>(null);
  const [pagandoPartId, setPagandoPartId] = useState<string | null>(null);

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
        body: JSON.stringify({ fecha, monto: m, observaciones: observaciones.trim() || null }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? "Error al guardar");
      }
      setShowForm(false);
      setMonto("");
      setObservaciones("");
      setFecha(hoy());
      await load();
    } catch (e: any) {
      setErrMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePagoParticipante(participanteId: string, nombre: string, m: number) {
    setPagandoPartId(participanteId);
    setErrMsg(null);
    try {
      const res = await fetch(`/api/admin/ordenes/${ordenId}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: hoy(),
          monto: m,
          observaciones: `Pago de ${nombre} (pastel compartido)`,
          participanteId,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? "Error al guardar");
      }
      setConfirmPartId(null);
      await load();
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setPagandoPartId(null);
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
    <div className="flex flex-col gap-3 rounded-xl border border-hc-line bg-hc-hover px-3.5 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
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
          <span className="text-hc-muted">Total de la orden</span>
          <span className="font-semibold text-hc-ink">
            ${ordenTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-hc-muted">Pagado</span>
          <span className="font-semibold text-emerald-600">
            ${totalPagado.toFixed(2)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-white rounded-full overflow-hidden border border-hc-line">
          <div
            className="h-full rounded-full transition-all duration-500 bg-emerald-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-hc-muted">Pendiente</span>
          <span
            className={`font-bold ${
              liquidado ? "text-emerald-600" : "text-hc-rose"
            }`}
          >
            {liquidado ? "$0.00" : `$${saldo.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Pagos por participante (pasteles para compartir) */}
      {compartidos.map(({ compartido, monto: montoCompartido }) => {
        const activos = participantesActivos(compartido.participantes);
        if (activos.length === 0) return null;
        const montos = repartirMonto(montoCompartido, activos.length);
        return (
          <div key={compartido.id} className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
              Por participante · {compartido.productoNombre ?? "Pastel compartido"}
            </p>
            <p className="text-[11px] text-hc-muted">
              ${montoCompartido.toFixed(2)} entre {activos.length}{" "}
              {activos.length === 1 ? "persona" : "personas"}
            </p>
            {activos.map((p, i) => {
              const nombre = p.nombre ?? "Participante";
              const pagado = pagos.some((pg) => pg.participanteId === p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white border border-hc-line px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-hc-ink truncate">{nombre}</p>
                    <p className="text-[11px] text-hc-muted tabular-nums">${montos[i].toFixed(2)}</p>
                  </div>
                  {pagado ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      PAGADO
                    </span>
                  ) : confirmPartId === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-hc-muted">¿Registrar?</span>
                      <button
                        onClick={() => handlePagoParticipante(p.id, nombre, montos[i])}
                        disabled={pagandoPartId === p.id}
                        className="px-2 py-0.5 rounded-md bg-hc-rose text-white text-[10px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
                      >
                        {pagandoPartId === p.id ? "…" : "Sí"}
                      </button>
                      <button
                        onClick={() => setConfirmPartId(null)}
                        className="px-2 py-0.5 rounded-md border border-hc-line-strong text-hc-muted text-[10px] hover:bg-hc-sunken transition"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmPartId(p.id)}
                      className="px-2.5 py-1 rounded-lg border border-hc-line-strong text-hc-rose text-[11px] font-semibold hover:bg-hc-hover transition"
                    >
                      Registrar ${montos[i].toFixed(2)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Lista de pagos */}
      {loading ? (
        <p className="text-[11px] text-hc-muted">Cargando…</p>
      ) : pagos.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
            Historial
          </p>
          {pagos.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white border border-hc-line px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-hc-ink tabular-nums">
                    ${p.monto.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-hc-muted">{fmtDate(p.fecha)}</p>
                  {p.observaciones && (
                    <p className="mt-0.5 text-[11px] text-hc-muted whitespace-pre-wrap break-words">
                      {p.observaciones}
                    </p>
                  )}
                </div>
              </div>

              {confirmId === p.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-hc-muted">¿Eliminar?</span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting}
                    className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-0.5 rounded-md border border-hc-line-strong text-hc-muted text-[10px] hover:bg-hc-sunken transition"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(p.id)}
                  className="p-1 rounded-md hover:bg-red-50 text-hc-soft hover:text-red-500 transition"
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
        <p className="text-[11px] text-hc-soft text-center py-1">
          Sin pagos registrados
        </p>
      )}

      {/* Formulario de nuevo pago */}
      {showForm ? (
        <div className="flex flex-col gap-2 rounded-lg border border-hc-line-strong bg-white px-3 py-3">
          <p className="text-[10px] font-semibold text-hc-soft uppercase tracking-wider mb-0.5">
            Registrar pago
          </p>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-hc-muted font-medium">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="text-[12px] border border-hc-line-strong rounded-lg px-2.5 py-1.5 text-hc-ink focus:outline-none focus:border-hc-rose bg-white"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-hc-muted font-medium">Monto ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="text-[12px] border border-hc-line-strong rounded-lg px-2.5 py-1.5 text-hc-ink focus:outline-none focus:border-hc-rose bg-white tabular-nums"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-hc-muted font-medium">
              Observación <span className="font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Ej: transferencia, anticipo del 50%…"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="text-[12px] border border-hc-line-strong rounded-lg px-2.5 py-1.5 text-hc-ink focus:outline-none focus:border-hc-rose bg-white resize-none"
            />
          </div>
          {errMsg && (
            <p className="text-[11px] text-red-500">{errMsg}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-1.5 rounded-lg bg-hc-rose text-white text-[12px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
            >
              {saving ? "Guardando…" : "Guardar pago"}
            </button>
            <button
              onClick={() => { setShowForm(false); setMonto(""); setObservaciones(""); setErrMsg(null); }}
              className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-muted text-[12px] hover:bg-hc-sunken transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        !liquidado && (
          <button
            onClick={() => { setShowForm(true); setErrMsg(null); }}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-hc-line-strong text-hc-rose text-[12px] font-semibold hover:bg-white/60 transition"
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
