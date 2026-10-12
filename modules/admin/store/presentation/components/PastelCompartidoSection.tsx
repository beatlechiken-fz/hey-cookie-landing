"use client";
// src/modules/admin/store/presentation/components/PastelCompartidoSection.tsx

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import QRCode from "qrcode";
import {
  NOMBRE_PARTICIPANTE_MAX,
  participantesActivos,
  type PastelCompartido,
} from "../../domain/entities/PastelCompartido.entity";

interface Props {
  ordenId: string;
  ordenItemId: string;
  compartido: PastelCompartido | null;
  /** Recarga los enlaces de la orden (también refresca la sección de pagos). */
  onChange: () => Promise<void> | void;
}

/**
 * Partida marcada "para compartir" en Arma tu pedido: genera el enlace + QR
 * de invitación y administra la lista de participantes.
 */
export function PastelCompartidoSection({ ordenId, ordenItemId, compartido, onChange }: Props) {
  const locale = useLocale();
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [nuevo, setNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [quitandoId, setQuitandoId] = useState<string | null>(null);

  const url =
    compartido && typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/compartir/${compartido.token}`
      : null;

  useEffect(() => {
    if (!url) return;
    let vigente = true;
    QRCode.toDataURL(url, { width: 480, margin: 1, color: { dark: "#3A1F14", light: "#FFFFFF" } })
      .then((data) => vigente && setQr(data))
      .catch(() => vigente && setQr(null));
    return () => { vigente = false; };
  }, [url]);

  async function llamar(input: string, init: RequestInit) {
    setError(null);
    const res = await fetch(input, {
      ...init,
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "No se pudo completar la acción");
    await onChange();
  }

  async function generar() {
    setGenerando(true);
    try {
      await llamar(`/api/admin/ordenes/${ordenId}/compartir`, {
        method: "POST",
        body: JSON.stringify({ ordenItemId }),
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerando(false);
    }
  }

  async function agregar(solicitante: boolean) {
    if (!compartido) return;
    if (!solicitante && !nuevo.trim()) return;
    setGuardando(true);
    try {
      await llamar(`/api/admin/ordenes/${ordenId}/compartir/participantes`, {
        method: "POST",
        body: JSON.stringify({ compartidoId: compartido.id, nombre: nuevo.trim(), solicitante }),
      });
      if (!solicitante) setNuevo("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitar(participanteId: string) {
    setQuitandoId(participanteId);
    try {
      await llamar(`/api/admin/ordenes/${ordenId}/compartir/participantes/${participanteId}`, {
        method: "DELETE",
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setQuitandoId(null);
    }
  }

  async function copiar() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError("No se pudo copiar; selecciona el enlace y cópialo manualmente");
    }
  }

  const btn =
    "px-2.5 py-1 rounded-lg border border-[#e8c4a0] bg-white text-[11px] font-semibold text-[#AA6A42] hover:text-[#c0607a] hover:border-[#c0607a] transition disabled:opacity-50";

  if (!compartido) {
    return (
      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-dashed border-[#e8c4a0] bg-white px-3 py-2.5">
        <p className="text-[12px] text-[#6B3E26]">
          <span className="font-semibold text-[#3A1F14]">Para compartir</span> — el cliente pidió
          invitar a más personas y dividir el pago.
        </p>
        <button onClick={generar} disabled={generando} className={`${btn} self-start`}>
          {generando ? "Generando…" : "Generar enlace y QR"}
        </button>
        {error && <p className="text-[11px] text-[#C0392B]">{error}</p>}
      </div>
    );
  }

  const activos = participantesActivos(compartido.participantes);
  const noParticipan = compartido.participantes.filter((p) => !p.participa).length;
  const tieneSolicitante = activos.some((p) => p.origen === "solicitante");

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-lg border border-[#e8c4a0] bg-white px-3 py-3">
      <p className="text-[10px] font-semibold text-[#AA6A42] uppercase tracking-wider">
        Para compartir
      </p>

      {/* Enlace + QR */}
      <div className="flex flex-col sm:flex-row gap-3">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL generada en el navegador
          <img
            src={qr}
            alt="Código QR de la invitación"
            className="w-32 h-32 rounded-lg border border-[#f0e0d0] self-center sm:self-start"
          />
        )}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <input
            readOnly
            value={url ?? ""}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Enlace de invitación"
            className="w-full text-[12px] border border-[#e8c4a0] rounded-lg px-2.5 py-1.5 text-[#3d1a24] bg-[#FFF7F0]"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={copiar} className={btn}>
              {copiado ? "¡Copiado!" : "Copiar enlace"}
            </button>
            {qr && (
              <a href={qr} download={`invitacion-${compartido.token}.png`} className={btn}>
                Descargar QR
              </a>
            )}
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className={btn}>
                Ver invitación
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Participantes */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] text-[#6B3E26]">
          <span className="font-semibold text-[#3A1F14]">{activos.length}</span>{" "}
          {activos.length === 1 ? "participante" : "participantes"}
          {noParticipan > 0 && ` · ${noParticipan} no ${noParticipan === 1 ? "participará" : "participarán"}`}
        </p>
        {activos.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-[#FFF7F0] border border-[#f0e0d0] px-2.5 py-1.5"
          >
            <span className="text-[12px] text-[#3d1a24] truncate">
              {p.nombre ?? "Sin nombre"}
              {p.origen === "solicitante" && (
                <span className="ml-1.5 text-[10px] font-semibold text-[#AA6A42]">(solicitante)</span>
              )}
              {p.origen === "admin" && (
                <span className="ml-1.5 text-[10px] text-[#6B3E26]/70">(agregado por admin)</span>
              )}
            </span>
            <button
              onClick={() => quitar(p.id)}
              disabled={quitandoId === p.id}
              className="p-1 rounded-md hover:bg-red-50 text-[#AA6A42] hover:text-red-500 transition disabled:opacity-50"
              aria-label={`Quitar a ${p.nombre ?? "participante"}`}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}

        <div className="flex gap-2 mt-1">
          <input
            value={nuevo}
            maxLength={NOMBRE_PARTICIPANTE_MAX}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregar(false)}
            placeholder="Agregar participante"
            aria-label="Nombre del participante a agregar"
            className="flex-1 min-w-0 text-[12px] border border-[#e8c4a0] rounded-lg px-2.5 py-1.5 text-[#3d1a24] focus:outline-none focus:border-[#c0607a] bg-white"
          />
          <button onClick={() => agregar(false)} disabled={guardando || !nuevo.trim()} className={btn}>
            Agregar
          </button>
        </div>
        {!tieneSolicitante && (
          <button onClick={() => agregar(true)} disabled={guardando} className={`${btn} self-start`}>
            Agregar al solicitante{compartido.solicitanteNombre ? ` (${compartido.solicitanteNombre})` : ""}
          </button>
        )}
      </div>

      {error && <p className="text-[11px] text-[#C0392B]">{error}</p>}
    </div>
  );
}
