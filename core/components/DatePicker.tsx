"use client";
// Selector de fecha propio (reemplaza <input type="date">, que se ve distinto y
// chico en cada navegador). Vistas: días, meses y años; al elegir un día se
// cierra. En pantallas chicas se abre como hoja inferior.
// Valor y límites en formato "YYYY-MM-DD" (sin zona horaria).

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Vista = "dias" | "meses" | "anios";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  /** Vista con la que abre cuando no hay valor (para cumpleaños conviene "anios"). */
  vistaInicial?: Vista;
  /** Año que se muestra al abrir sin valor. */
  anioInicial?: number;
  className?: string;
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

type Ymd = { y: number; m: number; d: number }; // m: 0-11

function parse(s?: string): Ymd | null {
  const r = s?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return r ? { y: +r[1], m: +r[2] - 1, d: +r[3] } : null;
}

function fmt({ y, m, d }: Ymd): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function etiqueta(v: Ymd): string {
  return `${v.d} de ${MESES[v.m].toLowerCase()} de ${v.y}`;
}

const diasEnMes = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function DatePicker({
  id,
  value,
  onChange,
  min = "1900-01-01",
  max,
  placeholder = "Selecciona una fecha",
  vistaInicial = "dias",
  anioInicial,
  className = "",
}: Props) {
  const hoy = new Date();
  const hoyStr = fmt({ y: hoy.getFullYear(), m: hoy.getMonth(), d: hoy.getDate() });
  const maxStr = max ?? `${hoy.getFullYear() + 10}-12-31`;
  const minY = parse(min)!.y;
  const maxY = parse(maxStr)!.y;
  const sel = parse(value);

  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<Vista>("dias");
  const [y, setY] = useState(sel?.y ?? anioInicial ?? hoy.getFullYear());
  const [m, setM] = useState(sel?.m ?? hoy.getMonth());

  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const anioSel = useRef<HTMLButtonElement>(null);
  const dialogoId = useId();

  function abrir() {
    const v = parse(value);
    setY(v?.y ?? anioInicial ?? hoy.getFullYear());
    setM(v?.m ?? hoy.getMonth());
    setVista(v ? "dias" : vistaInicial);
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    boton.current?.focus();
  }

  // Cerrar con clic fuera o Escape.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (vista !== "dias") setVista("dias");
        else cerrar();
      }
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto, vista]);

  // En la vista de años, centrar el año actual de la vista.
  useEffect(() => {
    if (abierto && vista === "anios") anioSel.current?.scrollIntoView({ block: "center" });
  }, [abierto, vista]);

  const mesAnterior = () => (m === 0 ? (setM(11), setY(y - 1)) : setM(m - 1));
  const mesSiguiente = () => (m === 11 ? (setM(0), setY(y + 1)) : setM(m + 1));
  const puedeAnterior = fmt({ y, m, d: 1 }) > min;
  const puedeSiguiente = fmt({ y, m, d: diasEnMes(y, m) }) < maxStr;

  function elegirDia(d: number) {
    onChange(fmt({ y, m, d }));
    cerrar();
  }

  // Celdas del mes: huecos iniciales + días.
  const primerDia = new Date(y, m, 1).getDay();
  const celdas: (number | null)[] = [...Array(primerDia).fill(null), ...Array.from({ length: diasEnMes(y, m) }, (_, i) => i + 1)];

  const anios: number[] = [];
  for (let a = maxY; a >= minY; a--) anios.push(a);

  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-[#6B3E26] transition hover:bg-[#F6DDE4] disabled:pointer-events-none disabled:opacity-30";

  const panel = (
    <div className="flex flex-col">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-1 px-1 pb-3">
        {vista === "dias" ? (
          <button type="button" onClick={mesAnterior} disabled={!puedeAnterior} aria-label="Mes anterior" className={navBtn}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        ) : (
          <span className="h-9 w-9" />
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setVista(vista === "meses" ? "dias" : "meses")}
            aria-expanded={vista === "meses"}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[15px] font-semibold transition ${vista === "meses" ? "bg-[#F6DDE4] text-[#A84D66]" : "text-[#3A1F14] hover:bg-[#FBEEF2]"}`}
          >
            {MESES[m]}
            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${vista === "meses" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setVista(vista === "anios" ? "dias" : "anios")}
            aria-expanded={vista === "anios"}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[15px] font-semibold tabular-nums transition ${vista === "anios" ? "bg-[#F6DDE4] text-[#A84D66]" : "text-[#3A1F14] hover:bg-[#FBEEF2]"}`}
          >
            {y}
            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${vista === "anios" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>

        {vista === "dias" ? (
          <button type="button" onClick={mesSiguiente} disabled={!puedeSiguiente} aria-label="Mes siguiente" className={navBtn}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        ) : (
          <span className="h-9 w-9" />
        )}
      </div>

      {/* Cuerpo: altura fija para que no salte al cambiar de vista */}
      <div className="h-[296px]">
        {vista === "dias" && (
          <div>
            <div className="grid grid-cols-7 pb-1">
              {DIAS_SEMANA.map((d) => (
                <span key={d} className="flex h-8 items-center justify-center text-[12px] font-semibold uppercase text-[#AA6A42]">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1" role="grid">
              {celdas.map((d, i) => {
                if (d === null) return <span key={`h${i}`} />;
                const s = fmt({ y, m, d });
                const deshabilitado = cmp(s, min) < 0 || cmp(s, maxStr) > 0;
                const esSel = value === s;
                const esHoy = hoyStr === s;
                return (
                  <div key={s} className="flex justify-center">
                    <button
                      type="button"
                      disabled={deshabilitado}
                      onClick={() => elegirDia(d)}
                      aria-pressed={esSel}
                      aria-label={etiqueta({ y, m, d })}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] tabular-nums transition ${
                        esSel
                          ? "bg-[#C0607A] font-bold text-white shadow-[0_6px_14px_-6px_rgba(192,96,122,0.9)]"
                          : esHoy
                            ? "font-semibold text-[#A84D66] ring-1 ring-inset ring-[#C0607A]/50 hover:bg-[#FBEEF2]"
                            : "text-[#3A1F14] hover:bg-[#FBEEF2]"
                      } disabled:pointer-events-none disabled:text-[#3A1F14]/25`}
                    >
                      {d}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {vista === "meses" && (
          <div className="grid h-full grid-cols-3 content-center gap-2">
            {MESES.map((nombre, i) => {
              const deshabilitado = fmt({ y, m: i, d: diasEnMes(y, i) }) < min || fmt({ y, m: i, d: 1 }) > maxStr;
              const activo = i === m;
              return (
                <button
                  key={nombre}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => {
                    setM(i);
                    setVista("dias");
                  }}
                  className={`h-14 rounded-2xl text-[14px] font-medium transition ${
                    activo ? "bg-[#C0607A] font-semibold text-white" : "text-[#3A1F14] hover:bg-[#FBEEF2]"
                  } disabled:pointer-events-none disabled:opacity-30`}
                >
                  {nombre.slice(0, 3)}
                </button>
              );
            })}
          </div>
        )}

        {vista === "anios" && (
          <div className="grid h-full grid-cols-4 content-start gap-2 overflow-y-auto overscroll-contain pr-1">
            {anios.map((a) => {
              const activo = a === y;
              return (
                <button
                  key={a}
                  ref={activo ? anioSel : undefined}
                  type="button"
                  onClick={() => {
                    setY(a);
                    // Si el mes queda fuera de rango en ese año, ajustarlo.
                    if (fmt({ y: a, m, d: 1 }) > maxStr) setM(parse(maxStr)!.m);
                    if (fmt({ y: a, m, d: diasEnMes(a, m) }) < min) setM(parse(min)!.m);
                    setVista("meses");
                  }}
                  className={`h-11 rounded-2xl text-[14px] tabular-nums transition ${
                    activo ? "bg-[#C0607A] font-semibold text-white" : "text-[#3A1F14] hover:bg-[#FBEEF2]"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pie */}
      <div className="mt-3 flex items-center justify-between border-t border-[#f0e0d0] pt-3">
        <button
          type="button"
          onClick={() => {
            onChange("");
            cerrar();
          }}
          disabled={!value}
          className="rounded-full px-3 py-2 text-[13px] font-semibold text-[#6B3E26] transition hover:bg-[#FBEEF2] disabled:opacity-0"
        >
          Borrar
        </button>
        <button type="button" onClick={cerrar} className="rounded-full px-4 py-2 text-[13px] font-semibold text-[#A84D66] transition hover:bg-[#FBEEF2]">
          Cerrar
        </button>
      </div>
    </div>
  );

  return (
    <div ref={raiz} className="relative">
      <button
        ref={boton}
        id={id}
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={abierto ? dialogoId : undefined}
        className={`flex items-center justify-between gap-3 text-left ${className}`}
      >
        <span className={sel ? "" : "text-[#3A1F14]/45"}>{sel ? etiqueta(sel) : placeholder}</span>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-[#AA6A42]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      <AnimatePresence>
        {abierto && (
          <>
            {/* Fondo solo en móvil (hoja inferior) */}
            <motion.div
              key="fondo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-[#3A1F14]/30 backdrop-blur-[2px] sm:hidden"
              onClick={() => setAbierto(false)}
              aria-hidden
            />
            <motion.div
              key="panel"
              id={dialogoId}
              role="dialog"
              aria-modal="false"
              aria-label="Seleccionar fecha"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl border border-[#f0e0d0] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-12px_rgba(58,31,20,0.35)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[340px] sm:rounded-3xl sm:shadow-[0_20px_50px_-16px_rgba(58,31,20,0.35)]"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#e0c9b0] sm:hidden" aria-hidden />
              {panel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
