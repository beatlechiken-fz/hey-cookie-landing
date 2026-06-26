"use client";
// src/modules/admin/clientes/presentation/components/OrdenPipeline.tsx
//
// Pipeline visual del estatus de una orden/cotización.
// cotizacion → en_proceso → listo_entregar → pagado  (cancelado es un estado aparte)

import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";

const PIPELINE_STEPS: { value: OrdenStatus; label: string }[] = [
  { value: "cotizacion", label: "Cotización" },
  { value: "en_proceso", label: "En proceso" },
  { value: "listo_entregar", label: "Listo" },
  { value: "pagado", label: "Pagado" },
  { value: "entregado", label: "Entregado" },
];

interface Props {
  status: OrdenStatus;
}

export function OrdenPipeline({ status }: Props) {
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

  const currentIndex = PIPELINE_STEPS.findIndex((s) => s.value === status);

  return (
    <div className="flex items-center">
      {PIPELINE_STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === PIPELINE_STEPS.length - 1;

        return (
          <div key={step.value} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition " +
                  (isDone
                    ? "bg-[#c0607a] border-[#c0607a] text-white"
                    : isCurrent
                      ? "bg-white border-[#c0607a] text-[#c0607a]"
                      : "bg-white border-[#e8c4cd] text-[#c0a0a8]")
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
              </div>
              <span
                className={
                  "text-[10px] font-medium whitespace-nowrap " +
                  (isCurrent
                    ? "text-[#c0607a]"
                    : isDone
                      ? "text-[#7b2d42]"
                      : "text-[#c0a0a8]")
                }
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={
                  "h-0.5 w-8 sm:w-12 -mt-4 " +
                  (isDone ? "bg-[#c0607a]" : "bg-[#f5dce4]")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
