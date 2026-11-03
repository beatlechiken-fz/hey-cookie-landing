"use client";
// Cambio rápido de estado desde el pipeline del detalle de una orden. Los
// cambios que ya no se pueden deshacer (salir de cotización, pagar, entregar)
// piden confirmación en línea antes de guardarse.

import { useState } from "react";
import {
  ORDEN_STATUS_LABELS,
  esCambioSinRetorno,
  type OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";
import { OrdenPipeline } from "./OrdenPipeline";

interface Props {
  status: OrdenStatus;
  onCambiar: (status: OrdenStatus) => Promise<void>;
  updating: boolean;
}

function avisoSinRetorno(desde: OrdenStatus, hacia: OrdenStatus): string {
  if (hacia === "pagado" || hacia === "entregado")
    return "Ya no podrá regresar a un estado anterior.";
  if (desde === "cotizacion") return "Ya no podrá regresar a Cotización.";
  return "";
}

export function OrdenEstadoControl({ status, onCambiar, updating }: Props) {
  const [pendiente, setPendiente] = useState<OrdenStatus | null>(null);

  function alElegir(next: OrdenStatus) {
    if (esCambioSinRetorno(status, next)) {
      setPendiente(next);
      return;
    }
    void onCambiar(next);
  }

  async function confirmar() {
    if (!pendiente) return;
    await onCambiar(pendiente);
    setPendiente(null);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex max-w-full justify-center overflow-x-auto py-1">
        <OrdenPipeline status={status} onSelect={alElegir} disabled={updating} />
      </div>
      {pendiente && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-hc-line bg-hc-hover px-3 py-2">
          <p className="text-[12.5px] text-hc-ink">
            ¿Pasar a <span className="font-semibold">“{ORDEN_STATUS_LABELS[pendiente]}”</span>?{" "}
            <span className="text-hc-muted">{avisoSinRetorno(status, pendiente)}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendiente(null)}
              disabled={updating}
              className="px-2.5 py-1 rounded-lg border border-hc-line-strong bg-white text-hc-muted text-[12px] hover:bg-hc-sunken disabled:opacity-50 transition"
            >
              No
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={updating}
              className="px-2.5 py-1 rounded-lg bg-hc-rose text-white text-[12px] font-bold hover:bg-hc-rose-hover disabled:opacity-50 transition"
            >
              {updating ? "Actualizando…" : `Sí, pasar a "${ORDEN_STATUS_LABELS[pendiente]}"`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
