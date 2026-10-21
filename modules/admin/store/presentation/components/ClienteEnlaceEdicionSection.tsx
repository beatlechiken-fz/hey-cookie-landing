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
    <div className="rounded-2xl border border-hc-line bg-white shadow-sm p-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold text-hc-soft">Enlace para actualizar datos</h2>
        <p className="text-[13px] text-hc-muted">
          El cliente puede corregir su nombre, teléfono, email, dirección y fecha de
          nacimiento sin tener cuenta. Dura 30 días.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-hc-soft">Cargando…</p>
      ) : enlace ? (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-hc-hover border border-hc-line px-3 py-2">
            <code className="flex-1 truncate text-[12px] text-hc-ink">{enlace.url}</code>
          </div>
          <p className="text-[12px] text-hc-soft">
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
              className={`${btn} bg-hc-rose text-white border-hc-rose hover:bg-hc-rose-hover`}
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
              className={`${btn} border-hc-line-strong text-hc-muted hover:bg-hc-hover`}
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
          className={`${btn} self-start bg-hc-rose text-white border-hc-rose hover:bg-hc-rose-hover`}
        >
          {working ? "Generando…" : "Generar enlace"}
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
