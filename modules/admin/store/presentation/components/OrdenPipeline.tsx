"use client";
// src/modules/admin/clientes/presentation/components/OrdenPipeline.tsx
//
// Pipeline visual del estatus de una orden/cotización.
// cotizacion → en_proceso → listo_entregar → pagado → entregado  (cancelado es un estado aparte)
//
// Con `onSelect` cada paso al que se puede llegar (`puedeCambiarEstado`) es un
// botón; los que no, se ven pero no se pueden tocar.

import {
  ORDEN_PIPELINE,
  puedeCambiarEstado,
  type OrdenStatus,
} from "@/modules/admin/store/domain/entities/Orden.entity";

const STEP_LABELS: Partial<Record<OrdenStatus, string>> = {
  cotizacion: "Cotización",
  en_proceso: "En proceso",
  listo_entregar: "Listo",
  pagado: "Pagado",
  entregado: "Entregado",
};

interface Props {
  status: OrdenStatus;
  /** Si viene, los pasos alcanzables se pueden tocar para cambiar de estado. */
  onSelect?: (status: OrdenStatus) => void;
  /** Bloquea los pasos mientras se guarda un cambio. */
  disabled?: boolean;
}

function circleClass(isDone: boolean, isCurrent: boolean, isSelectable: boolean) {
  if (isDone) return "bg-hc-rose border-hc-rose text-white";
  if (isCurrent) return "bg-white border-hc-rose text-hc-rose";
  if (isSelectable) return "bg-white border-hc-line-strong text-hc-muted group-hover:border-hc-rose group-hover:text-hc-rose";
  return "bg-white border-hc-line-strong text-hc-soft";
}

export function OrdenPipeline({ status, onSelect, disabled = false }: Props) {
  if (status === "cancelado") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
        <span className="text-[13px] font-semibold text-red-600">
          Cancelado
        </span>
      </div>
    );
  }

  const currentIndex = ORDEN_PIPELINE.indexOf(status);

  return (
    <div className="flex items-start">
      {ORDEN_PIPELINE.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === ORDEN_PIPELINE.length - 1;
        const isSelectable = !!onSelect && puedeCambiarEstado(status, step);
        const label = STEP_LABELS[step];

        const contenido = (
          <>
            <span
              className={
                "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition " +
                circleClass(isDone, isCurrent, isSelectable)
              }
            >
              {isDone ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={
                "text-[10px] font-medium whitespace-nowrap " +
                (isCurrent ? "text-hc-rose" : isSelectable ? "text-hc-muted group-hover:text-hc-rose" : "text-hc-soft")
              }
            >
              {label}
            </span>
          </>
        );

        return (
          <div key={step} className="flex items-start">
            {isSelectable ? (
              <button
                type="button"
                onClick={() => onSelect(step)}
                disabled={disabled}
                title={`Pasar a "${label}"`}
                className="group flex flex-col items-center gap-1 rounded-lg px-1 transition disabled:cursor-wait disabled:opacity-60"
              >
                {contenido}
              </button>
            ) : (
              <div
                className={`flex flex-col items-center gap-1 px-1 ${onSelect && !isCurrent && !isDone ? "opacity-50" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {contenido}
              </div>
            )}
            {!isLast && (
              <div
                className={
                  "h-0.5 w-6 sm:w-12 mt-3.5 " +
                  (isDone ? "bg-hc-rose" : "bg-hc-sunken")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
