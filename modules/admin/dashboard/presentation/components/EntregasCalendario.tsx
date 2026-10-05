"use client";
// src/modules/admin/dashboard/presentation/components/EntregasCalendario.tsx
//
// Calendario mensual con las entregas de las órdenes (por fecha de entrega).
// Click en una entrega → detalle de la orden; click en un día con varias
// entregas → lista de ese día.

import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  agruparPorDia,
  buildMonthGrid,
  hoyKey,
} from "@/core/helpers/calendario";
import { ORDEN_STATUS_LABELS } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { EntregaCalendario } from "@/app/api/admin/ordenes/calendario/route";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_CHIPS = 2;

const ordenHref = (id: string) => `/admin/dashboard/store/ordenes/${id}`;

const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const labelStatus = (s: string) =>
  ORDEN_STATUS_LABELS[s as OrdenStatus] ?? s;

/** Entregado va atenuado; lo pendiente destaca. */
const chipCls = (status: string) =>
  status === "entregado"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-[#FBE9EE] text-[#c0607a] border-[#f3c9d4]";

function fechaLarga(key: string) {
  return new Date(key + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function EntregasCalendario() {
  const router = useRouter();
  const hoy = hoyKey();
  const [anio, setAnio] = useState(() => Number(hoy.slice(0, 4)));
  const [mes0, setMes0] = useState(() => Number(hoy.slice(5, 7)) - 1);
  const [entregas, setEntregas] = useState<EntregaCalendario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [diaSel, setDiaSel] = useState<string | null>(null);

  const semanas = useMemo(() => buildMonthGrid(anio, mes0), [anio, mes0]);
  const desde = semanas[0][0].fecha;
  const hasta = semanas[semanas.length - 1][6].fecha;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/ordenes/calendario?desde=${desde}&hasta=${hasta}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("calendario"))))
      .then((d: EntregaCalendario[]) => {
        if (!cancelled) {
          setEntregas(d);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las entregas.");
      });
    return () => {
      cancelled = true;
    };
  }, [desde, hasta]);

  const porDia = useMemo(
    () => agruparPorDia(entregas, (e) => e.fechaEntrega),
    [entregas],
  );

  function irA(delta: number) {
    const d = new Date(Date.UTC(anio, mes0 + delta, 1));
    setAnio(d.getUTCFullYear());
    setMes0(d.getUTCMonth());
    setDiaSel(null);
  }

  function irAHoy() {
    setAnio(Number(hoy.slice(0, 4)));
    setMes0(Number(hoy.slice(5, 7)) - 1);
    setDiaSel(null);
  }

  function clickDia(fecha: string) {
    const lista = porDia.get(fecha) ?? [];
    if (lista.length === 0) {
      setDiaSel(null);
    } else if (lista.length === 1) {
      router.push(ordenHref(lista[0].id));
    } else {
      setDiaSel((s) => (s === fecha ? null : fecha));
    }
  }

  const titulo = new Date(Date.UTC(anio, mes0, 1)).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const listaSel = diaSel ? (porDia.get(diaSel) ?? []) : [];
  const btnCls =
    "px-2.5 py-1.5 rounded-lg border border-[#e8c4a0] text-[#AA6A42] text-[12px] font-semibold hover:bg-[#FFF7F0] transition";

  return (
    <section
      aria-label="Calendario de entregas"
      className="bg-white rounded-2xl border border-[#f0e0d0] shadow-sm p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[13px] font-bold text-[#AA6A42] uppercase tracking-wider">
            Entregas
          </h2>
          <p className="text-sm text-[#6B3E26]/70 capitalize">{titulo}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => irA(-1)} className={btnCls} aria-label="Mes anterior">
            ‹
          </button>
          <button onClick={irAHoy} className={btnCls}>
            Hoy
          </button>
          <button onClick={() => irA(1)} className={btnCls} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-[#f0e0d0] bg-[#f0e0d0]">
        {DIAS.map((d) => (
          <div
            key={d}
            className="bg-[#FFF7F0] py-1.5 text-center text-[10px] font-semibold text-[#6B3E26] uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
        {semanas.flat().map(({ fecha, enMes }) => {
          const lista = porDia.get(fecha) ?? [];
          const esHoy = fecha === hoy;
          const sel = fecha === diaSel;
          return (
            <div
              key={fecha}
              className={
                "relative min-h-[3.5rem] md:min-h-[5.5rem] p-1 md:p-1.5 flex flex-col gap-1 " +
                (enMes ? "bg-white" : "bg-[#FFF7F0]/60") +
                (sel ? " ring-2 ring-inset ring-[#c0607a]" : "")
              }
            >
              {lista.length > 0 && (
                <button
                  type="button"
                  onClick={() => clickDia(fecha)}
                  aria-label={`${fechaLarga(fecha)}: ${lista.length} entrega${lista.length !== 1 ? "s" : ""}`}
                  className="absolute inset-0 hover:bg-[#FFF7F0]/70 transition"
                />
              )}
              <span
                className={
                  "relative pointer-events-none text-[11px] md:text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-full " +
                  (esHoy
                    ? "bg-[#c0607a] text-white"
                    : enMes
                      ? "text-[#3d1a24]"
                      : "text-[#AA6A42]/50")
                }
              >
                {Number(fecha.slice(8))}
              </span>

              {/* Móvil: solo un contador, el tap abre el día */}
              {lista.length > 0 && (
                <span className="md:hidden relative pointer-events-none self-start px-1.5 rounded-full bg-[#c0607a] text-white text-[10px] font-bold">
                  {lista.length}
                </span>
              )}

              {/* Desktop: chips con enlace directo a la orden */}
              <div className="hidden md:flex flex-col gap-1 relative">
                {lista.slice(0, MAX_CHIPS).map((e) => (
                  <Link
                    key={e.id}
                    href={ordenHref(e.id)}
                    title={`#${e.numero} · ${e.clienteNombre ?? "Sin cliente"} · ${labelStatus(e.status)}`}
                    className={
                      "truncate rounded-md border px-1.5 py-0.5 text-[11px] font-medium hover:brightness-95 transition " +
                      chipCls(e.status)
                    }
                  >
                    #{e.numero} · {e.clienteNombre ?? "Sin cliente"}
                  </Link>
                ))}
                {lista.length > MAX_CHIPS && (
                  <button
                    type="button"
                    onClick={() => setDiaSel(fecha)}
                    className="text-left text-[11px] font-semibold text-[#AA6A42] hover:text-[#c0607a] transition"
                  >
                    +{lista.length - MAX_CHIPS} más
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {diaSel && listaSel.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#f0e0d0] bg-[#FFF7F0] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#AA6A42] capitalize">
              {fechaLarga(diaSel)}
            </p>
            <button
              onClick={() => setDiaSel(null)}
              className="text-[11px] font-semibold text-[#6B3E26] hover:text-[#c0607a] transition"
            >
              Cerrar
            </button>
          </div>
          <ul className="flex flex-col gap-1.5">
            {listaSel.map((e) => (
              <li key={e.id}>
                <Link
                  href={ordenHref(e.id)}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white border border-[#f0e0d0] px-3 py-2 hover:border-[#c0607a] transition"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#3d1a24] truncate">
                      #{e.numero} · {e.clienteNombre ?? "Sin cliente"}
                    </span>
                    <span
                      className={
                        "inline-block mt-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold " +
                        chipCls(e.status)
                      }
                    >
                      {labelStatus(e.status)}
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-[#c0607a] shrink-0">
                    {fmtMXN(e.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
