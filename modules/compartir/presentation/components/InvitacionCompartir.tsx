"use client";

import { useState } from "react";
import Image from "next/image";
import Icons from "@/core/assets/Icons";
import {
  NOMBRE_PARTICIPANTE_MAX,
  type PastelCompartidoPublico,
} from "@/modules/admin/store/domain/entities/PastelCompartido.entity";

interface Props {
  token: string;
  invitacion: PastelCompartidoPublico | null;
}

type Estado = "pendiente" | "participa" | "no_participa";

export function InvitacionCompartir({ token, invitacion }: Props) {
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState<Estado>("pendiente");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!invitacion || !invitacion.activo) {
    return (
      <div className="max-w-xl mx-auto text-center bg-[#FFFAF5] rounded-3xl p-8 shadow-sm border border-[#f0e0d0]">
        <h1 className="text-3xl font-title text-[#DA6C94]">Enlace no disponible</h1>
        <p className="text-[#6B3E26] mt-3">
          Esta invitación no existe o ya no está activa. Si crees que es un error, pide a quien te la envió un nuevo enlace.
        </p>
      </div>
    );
  }

  const producto = invitacion.esGelatina ? "la gelatina" : "el pastel";
  const solicitante = invitacion.solicitanteNombre ?? "un amigo";

  async function responder(participa: boolean) {
    if (participa && !nombre.trim()) {
      setError("Escribe tu nombre para sumarte");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/compartir/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participa, nombre: participa ? nombre.trim() : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar tu respuesta");
      setEstado(participa ? "participa" : "no_participa");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-[#FFFAF5] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#f0e0d0] text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#AA6A42]">Invitación</p>
      <h1 className="text-3xl sm:text-4xl font-title text-[#DA6C94] mt-2 leading-tight">
        ¡Has sido invitado a {producto} de {solicitante}!
      </h1>
      <div className="w-full flex justify-center pt-3">
        <Image src={Icons.wavesPink} alt="" width={120} height={20} />
      </div>

      {invitacion.imagenUrl && (
        <div className="relative mt-6 mx-auto w-full max-w-sm aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={invitacion.imagenUrl}
            alt={invitacion.productoNombre ?? "Referencia"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {invitacion.productoNombre && (
        <p className="mt-6 text-lg font-semibold text-[#A8386A]">{invitacion.productoNombre}</p>
      )}
      {invitacion.descripcion && (
        <p className="mt-2 text-[#6B3E26] leading-relaxed">{invitacion.descripcion}</p>
      )}

      <div className="mt-8" aria-live="polite">
        {estado === "pendiente" ? (
          <div className="flex flex-col gap-3 text-left">
            <label htmlFor="nombre-participante" className="text-sm font-semibold text-[#3A1F14]">
              ¿Quieres participar? Escribe tu nombre
            </label>
            <input
              id="nombre-participante"
              type="text"
              value={nombre}
              maxLength={NOMBRE_PARTICIPANTE_MAX}
              autoComplete="name"
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && responder(true)}
              placeholder="Tu nombre"
              className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#AA6A42]"
            />
            {error && <p className="text-sm text-[#C0392B]">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-1">
              <button
                type="button"
                onClick={() => responder(true)}
                disabled={enviando}
                className="flex-1 py-3 rounded-2xl bg-[#AA6A42] text-white text-sm font-bold hover:bg-[#8a5535] disabled:opacity-50 transition"
              >
                {enviando ? "Enviando…" : "Sí, quiero participar"}
              </button>
              <button
                type="button"
                onClick={() => responder(false)}
                disabled={enviando}
                className="flex-1 py-3 rounded-2xl border border-[#e0c9b0] text-[#6B3E26] text-sm font-semibold hover:bg-[#FFF0E6] disabled:opacity-50 transition"
              >
                No participar
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#FFF0E6] border border-[#e8c4a0] px-5 py-6">
            <p className="text-xl font-title text-[#A8386A]">
              {estado === "participa" ? `¡Gracias, ${nombre.trim()}!` : "¡Gracias por responder!"}
            </p>
            <p className="text-sm text-[#6B3E26] mt-2">
              {estado === "participa"
                ? `Ya estás en la lista de ${producto} de ${solicitante}. El pago se dividirá en partes iguales entre quienes participen.`
                : `Le haremos saber a ${solicitante} tu respuesta.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
