// src/modules/admin/store/domain/entities/Promocion.entity.ts

/**
 * Promoción por volumen de un producto: "llévate `cantidad` piezas por `precio`",
 * opcionalmente limitada a ciertos días de la semana (ej. viernes 2×$40).
 *
 * Productos con la MISMA promoción (cantidad + precio + días) se combinan entre
 * sí: 1 Vainilla Chips + 1 Café un viernes = un paquete de 2×$40.
 */
export interface ProductoPromo {
  cantidad: number;
  precio: number;
  /** Días en que aplica: 0 = domingo … 6 = sábado. Vacío = todos los días. */
  dias: number[];
}

export const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const TIMEZONE = "America/Mexico_City";

/** Normaliza lo que venga de BD/JSON — null si no es una promoción válida. */
export function parsePromo(input: unknown): ProductoPromo | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const cantidad = Number(raw.cantidad);
  const precio = Number(raw.precio);
  if (!Number.isInteger(cantidad) || cantidad < 2 || !(precio > 0)) return null;
  const dias = Array.isArray(raw.dias)
    ? [...new Set<number>(raw.dias.map(Number))]
        .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
        .sort()
    : [];
  return { cantidad, precio, dias };
}

/** Día de la semana (0-6) en horario de CDMX, sin importar la zona del servidor/navegador. */
export function diaSemanaMx(fecha: Date = new Date()): number {
  const nombre = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(fecha);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(nombre);
}

export function promoAplica(
  promo: ProductoPromo,
  fecha: Date = new Date(),
): boolean {
  return promo.dias.length === 0 || promo.dias.includes(diaSemanaMx(fecha));
}

/** "Viernes 2×$40", "Lunes y Viernes 3×$60" o "2×$40" (todos los días). */
export function promoEtiqueta(promo: ProductoPromo): string {
  const oferta = `${promo.cantidad}×$${promo.precio.toFixed(0)}`;
  if (promo.dias.length === 0 || promo.dias.length === 7) return oferta;
  const nombres = promo.dias.map((d) => DIAS_SEMANA[d]);
  const dias =
    nombres.length === 1
      ? nombres[0]
      : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
  return `${dias} ${oferta}`;
}

function promoKey(promo: ProductoPromo): string {
  return `${promo.cantidad}|${promo.precio}|${promo.dias.join(",")}`;
}

export interface PromoLinea {
  cantidad: number;
  precioUnitario: number;
  /** Snapshot de la promo del producto (vive en `configuracion.promo` del item). */
  promo?: unknown;
}

/**
 * Descuento total por promociones para un conjunto de partidas en una fecha.
 * Agrupa las piezas por promoción idéntica, arma paquetes empezando por las
 * piezas más caras y descuenta (suma de los precios del paquete − precio promo).
 * Las piezas que no completan un paquete se cobran a precio normal.
 */
export function calcularDescuentoPromos(
  lineas: PromoLinea[],
  fecha: Date = new Date(),
): number {
  const grupos = new Map<string, { promo: ProductoPromo; precios: number[] }>();

  for (const l of lineas) {
    const promo = parsePromo(l.promo);
    if (!promo || !promoAplica(promo, fecha)) continue;
    const key = promoKey(promo);
    const g = grupos.get(key) ?? { promo, precios: [] };
    for (let i = 0; i < l.cantidad; i++) g.precios.push(l.precioUnitario);
    grupos.set(key, g);
  }

  let descuento = 0;
  for (const { promo, precios } of grupos.values()) {
    precios.sort((a, b) => b - a);
    const paquetes = Math.floor(precios.length / promo.cantidad);
    for (let p = 0; p < paquetes; p++) {
      const suma = precios
        .slice(p * promo.cantidad, (p + 1) * promo.cantidad)
        .reduce((s, x) => s + x, 0);
      descuento += Math.max(0, suma - promo.precio);
    }
  }
  return Math.round(descuento * 100) / 100;
}

/** Atajo para partidas de carrito/orden: la promo viaja en `configuracion.promo`. */
export function descuentoPromosDeItems(
  items: { cantidad: number; precioUnitario: number; configuracion?: unknown }[],
  fecha: Date = new Date(),
): number {
  return calcularDescuentoPromos(
    items.map((i) => ({
      cantidad: Number(i.cantidad),
      precioUnitario: Number(i.precioUnitario),
      promo: (i.configuracion as { promo?: unknown } | null | undefined)?.promo,
    })),
    fecha,
  );
}
