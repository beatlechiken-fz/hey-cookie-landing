// core/helpers/calendario.ts
//
// Helpers puros para el calendario mensual (semanas de lunes a domingo).
// Todo trabaja con strings "YYYY-MM-DD" para evitar problemas de zona horaria.

export interface DiaCalendario {
  /** "YYYY-MM-DD" */
  fecha: string;
  /** Pertenece al mes que se está mostrando (los demás son relleno). */
  enMes: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** Fecha local de hoy como "YYYY-MM-DD". */
export function hoyKey(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Semanas (arreglos de 7 días, lunes primero) que cubren el mes `mes0` (0 = enero). */
export function buildMonthGrid(anio: number, mes0: number): DiaCalendario[][] {
  const primero = new Date(Date.UTC(anio, mes0, 1));
  const offset = (primero.getUTCDay() + 6) % 7; // lunes = 0
  const inicio = new Date(Date.UTC(anio, mes0, 1 - offset));
  const diasMes = new Date(Date.UTC(anio, mes0 + 1, 0)).getUTCDate();
  const semanas = Math.ceil((offset + diasMes) / 7);

  const out: DiaCalendario[][] = [];
  for (let w = 0; w < semanas; w++) {
    const fila: DiaCalendario[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(
        Date.UTC(
          inicio.getUTCFullYear(),
          inicio.getUTCMonth(),
          inicio.getUTCDate() + w * 7 + d,
        ),
      );
      fila.push({ fecha: toKey(dt), enMes: dt.getUTCMonth() === mes0 });
    }
    out.push(fila);
  }
  return out;
}

/** Agrupa elementos por día usando los primeros 10 caracteres de su fecha. */
export function agruparPorDia<T>(
  items: T[],
  getFecha: (item: T) => string | null | undefined,
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const f = getFecha(it)?.slice(0, 10);
    if (!f) continue;
    const list = map.get(f) ?? [];
    list.push(it);
    map.set(f, list);
  }
  return map;
}
