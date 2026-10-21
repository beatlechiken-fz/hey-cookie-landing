// Chip de estatus de una orden (lista de órdenes, tarjetas de orden).

import {
  ORDEN_STATUS_LABELS,
  type OrdenStatus,
} from "../../domain/entities/Orden.entity";

const STATUS_STYLES: Record<OrdenStatus, string> = {
  cotizacion: "bg-blue-50 text-blue-700 border-blue-200",
  en_proceso: "bg-amber-50 text-amber-700 border-amber-200",
  listo_entregar: "bg-purple-50 text-purple-700 border-purple-200",
  pagado: "bg-green-50 text-green-700 border-green-200",
  entregado: "bg-teal-50 text-teal-700 border-teal-200",
  cancelado: "bg-red-50 text-red-600 border-red-200",
};

export function OrdenStatusBadge({ status }: { status: OrdenStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] ?? ""}`}
    >
      {ORDEN_STATUS_LABELS[status] ?? status}
    </span>
  );
}
