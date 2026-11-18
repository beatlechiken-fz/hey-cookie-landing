"use client";
// Detalle de una prueba interna (orden con status "test"). Es de solo
// lectura: una prueba no cambia de estado, no tiene cliente, entrega,
// cupones, pagos ni finanzas. Solo se consulta y se genera su comanda.

import type { Orden } from "@/modules/admin/store/domain/entities/Orden.entity";
import { formatFechaCalendario } from "@/core/helpers/calendario";
import { OrdenPdfAcciones } from "./OrdenPdfAcciones";
import { OrdenSeccion } from "./OrdenSeccion";
import { OrdenStatusBadge } from "./OrdenStatusBadge";

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export function PruebaDetailCard({ orden }: { orden: Orden }) {
  return (
    <div className="flex flex-col gap-5">
      <OrdenPdfAcciones orden={orden} align="center" />

      <OrdenSeccion
        titulo={
          <span className="flex items-center gap-2">
            Prueba #{orden.numero}
            <OrdenStatusBadge status={orden.status} />
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600">
            <svg viewBox="0 0 24 24" className="mt-px h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Prueba interna: no cuenta en finanzas, inventario ni cashback, y no se puede modificar.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
              <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                Fecha de realización
              </p>
              <p className="text-[13px] font-semibold text-hc-ink mt-0.5">
                {orden.fechaRealizacion
                  ? formatFechaCalendario(orden.fechaRealizacion)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
              <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                Creada
              </p>
              <p className="text-[13px] font-semibold text-hc-ink mt-0.5">
                {formatFechaCalendario(orden.createdAt)}
              </p>
            </div>
          </div>

          {orden.notas && (
            <div className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2.5">
              <p className="text-[10px] font-semibold text-hc-muted uppercase tracking-wider">
                Observaciones
              </p>
              <p className="text-[13px] text-hc-ink mt-0.5 whitespace-pre-wrap">
                {orden.notas}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
              Productos
            </p>
            {orden.items.map((item, i) => (
              <div
                key={item.id ?? i}
                className="rounded-xl bg-hc-hover border border-hc-line px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-hc-ink truncate">
                      {item.nombre}
                    </p>
                    <p className="text-[11px] text-hc-muted">
                      {item.cantidad} × {fmtMoney(item.precioUnitario)}
                      {(item.configuracion as { diametroCm?: number } | null)?.diametroCm
                        ? ` · ${(item.configuracion as { diametroCm: number }).diametroCm}cm`
                        : ""}
                    </p>
                  </div>
                  <p className="font-bold text-hc-rose text-sm shrink-0">
                    {fmtMoney(item.subtotal)}
                  </p>
                </div>
                {item.observaciones && (
                  <p className="mt-1.5 text-[12px] text-hc-muted whitespace-pre-wrap break-words">
                    {item.observaciones}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 pt-1 border-t border-hc-line">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-hc-muted">Subtotal</span>
              <span className="text-hc-ink">{fmtMoney(orden.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-hc-soft">Total</span>
              <span className="font-bold text-hc-rose text-lg">{fmtMoney(orden.total)}</span>
            </div>
          </div>
        </div>
      </OrdenSeccion>
    </div>
  );
}
