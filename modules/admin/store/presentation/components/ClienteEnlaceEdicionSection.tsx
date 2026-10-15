"use client";
// src/modules/admin/store/presentation/components/ClienteEnlaceEdicionSection.tsx

import { useState } from "react";
import { useClienteEnlaceEdicion } from "../hooks/useClienteEnlaceEdicion";

interface Props {
  clienteId: string;
}

const btn =
  "px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition disabled:opacity-50";

export function ClienteEnlaceEdicionSection({ clienteId }: Props) {
  const { enlace, loading, working, error, generar, revocar } =
    useClienteEnlaceEdicion(clienteId);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!enlace) return;
    await navigator.clipboard.writeText(enlace.url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-[#f0e0d0] bg-white shadow-sm p-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold text-[#AA6A42]">Enlace para actualizar datos</h2>
        <p className="text-[13px] text-[#6B3E26]">
          El cliente puede corregir su nombre, teléfono, email, dirección y fecha de
          nacimiento sin tener cuenta. Dura 30 días.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[#AA6A42]">Cargando…</p>
      ) : enlace ? (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-[#FFF7F0] border border-[#f0e0d0] px-3 py-2">
            <code className="flex-1 truncate text-[12px] text-[#3d1a24]">{enlace.url}</code>
          </div>
          <p className="text-[12px] text-[#AA6A42]">
            Vence el{" "}
            {new Date(enlace.expiraAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copiar}
              className={`${btn} bg-[#c0607a] text-white border-[#c0607a] hover:bg-[#a84d66]`}
            >
              {copiado ? "¡Copiado!" : "Copiar enlace"}
            </button>
            {enlace.whatsappUrl && (
              <a
                href={enlace.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} border-green-300 text-green-700 hover:bg-green-50`}
              >
                Enviar por WhatsApp
              </a>
            )}
            <button
              onClick={() => generar(true)}
              disabled={working}
              className={`${btn} border-[#e8c4a0] text-[#6B3E26] hover:bg-[#FFF7F0]`}
            >
              Regenerar
            </button>
            <button
              onClick={revocar}
              disabled={working}
              className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}
            >
              Desactivar
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => generar(false)}
          disabled={working}
          className={`${btn} self-start bg-[#c0607a] text-white border-[#c0607a] hover:bg-[#a84d66]`}
        >
          {working ? "Generando…" : "Generar enlace"}
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
