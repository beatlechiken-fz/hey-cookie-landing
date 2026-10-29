"use client";
// src/modules/admin/store/presentation/components/BeneficiosAutomaticosSection.tsx
//
// Gestión del beneficio de cumpleaños (y futuros beneficios automáticos):
// configuración, disparo manual y últimos otorgamientos. Cada beneficio se
// ejecuta generando siempre un cupón — aquí solo se configura el porcentaje,
// el texto del regalo y la vigencia.

import { useState } from "react";
import { useBeneficiosAutomaticos } from "../hooks/useBeneficiosAutomaticos";
import type { BeneficioCumpleanosConfig } from "../../domain/entities/Beneficio.entity";

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

export function BeneficiosAutomaticosSection() {
  const { beneficios, otorgamientos, isLoading, error, update, generarCumpleanos } =
    useBeneficiosAutomaticos();

  const cumpleanos = beneficios.find((b) => b.tipo === "cumpleanos");
  const config = cumpleanos?.config as BeneficioCumpleanosConfig | undefined;

  const [editando, setEditando] = useState(false);
  const [descuento, setDescuento] = useState(20);
  const [regalo, setRegalo] = useState("");
  const [diasValidez, setDiasValidez] = useState(15);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function abrirEdicion() {
    if (config) {
      setDescuento(config.descuentoPorcentaje);
      setRegalo(config.regaloDescripcion);
      setDiasValidez(config.diasValidez);
    }
    setEditando(true);
  }

  async function guardar() {
    setGuardando(true);
    setActionError(null);
    try {
      await update("cumpleanos", {
        config: {
          descuentoPorcentaje: descuento,
          regaloDescripcion: regalo,
          diasValidez,
        },
      });
      setEditando(false);
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo() {
    if (!cumpleanos) return;
    setActionError(null);
    try {
      await update("cumpleanos", { activo: !cumpleanos.activo });
    } catch (e: any) {
      setActionError(e.message);
    }
  }

  async function disparar() {
    setGenerando(true);
    setActionError(null);
    setResultado(null);
    try {
      const r = await generarCumpleanos();
      setResultado(
        r.generados === 0
          ? "No hay cumpleaños pendientes por generar hoy."
          : `Generados ${r.generados} cupón${r.generados !== 1 ? "es" : ""} para: ${r.clientes.join(", ")}.`,
      );
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setGenerando(false);
    }
  }

  if (isLoading) return <p className="text-sm text-hc-soft">Cargando…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-hc-line bg-white shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-hc-soft">🎂 Cumpleaños</h2>
            <p className="text-[13px] text-hc-muted">
              Genera automáticamente un cupón de descuento + regalo el día del
              cumpleaños del cliente. Todo beneficio se entrega siempre como
              un cupón.
            </p>
          </div>
          <button
            onClick={toggleActivo}
            className={
              "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition " +
              (cumpleanos?.activo
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-500 border-gray-200")
            }
          >
            {cumpleanos?.activo ? "Activo" : "Inactivo"}
          </button>
        </div>

        {editando ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-hc-muted">
              Descuento (%)
              <input
                type="number"
                min={1}
                max={100}
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-hc-line-strong text-sm text-hc-ink focus:outline-none focus:border-hc-rose"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-hc-muted sm:col-span-2">
              Descripción del regalo
              <input
                type="text"
                value={regalo}
                onChange={(e) => setRegalo(e.target.value)}
                placeholder="Ej. una cookie de regalo en tu próxima compra"
                className="px-3 py-2 rounded-lg border border-hc-line-strong text-sm text-hc-ink focus:outline-none focus:border-hc-rose"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-hc-muted">
              Vigencia (días)
              <input
                type="number"
                min={1}
                value={diasValidez}
                onChange={(e) => setDiasValidez(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-hc-line-strong text-sm text-hc-ink focus:outline-none focus:border-hc-rose"
              />
            </label>
            <div className="flex gap-2 sm:col-span-3">
              <button
                onClick={guardar}
                disabled={guardando}
                className="px-3 py-1.5 rounded-lg bg-hc-rose text-white text-[13px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
              <button
                onClick={() => setEditando(false)}
                className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-muted text-[13px] font-semibold hover:bg-hc-hover transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          config && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
              <div className="text-[13px] text-hc-ink">
                <strong className="text-hc-rose">{config.descuentoPorcentaje}%</strong> de
                descuento + <span className="italic">{config.regaloDescripcion}</span>
                <span className="text-hc-soft"> · vigente {config.diasValidez} días</span>
              </div>
              <button
                onClick={abrirEdicion}
                className="shrink-0 p-1.5 rounded-lg hover:bg-hc-sunken text-hc-muted hover:text-hc-rose transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={disparar}
            disabled={generando}
            className="px-3 py-1.5 rounded-lg border border-hc-line-strong text-hc-muted text-[13px] font-semibold hover:bg-hc-hover disabled:opacity-50 transition"
          >
            {generando ? "Generando…" : "Generar cupones de hoy"}
          </button>
          <span className="text-[12px] text-hc-soft">
            Se dispara solo todos los días (7am); usa este botón si necesitas forzarlo.
          </span>
        </div>

        {resultado && <p className="text-sm text-green-700">{resultado}</p>}
        {actionError && <p className="text-sm text-red-600">{actionError}</p>}
      </div>

      <div className="rounded-2xl border border-hc-line bg-white shadow-sm p-5">
        <h3 className="text-sm font-bold text-hc-soft mb-3">Últimos otorgados</h3>
        {otorgamientos.length === 0 ? (
          <p className="text-sm text-hc-soft">Todavía no se ha otorgado ningún cupón de cumpleaños.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-hc-line">
            {otorgamientos.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-[13px] text-hc-ink">
                  {o.clienteNombre ?? "Cliente"}{" "}
                  {o.cuponCodigo && (
                    <span className="font-mono text-hc-rose">· {o.cuponCodigo}</span>
                  )}
                </span>
                <span className="text-[12px] text-hc-soft">{fecha(o.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
