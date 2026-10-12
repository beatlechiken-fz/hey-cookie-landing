// src/modules/admin/store/domain/entities/PastelCompartido.entity.ts

/**
 * "Pastel para compartir": un pastel/gelatina de "Arma tu pedido" marcado con
 * `configuracion.compartir = true` puede generar un enlace público donde otras
 * personas confirman si participan. El pago del producto se reparte en partes
 * iguales entre los participantes.
 */

export type OrigenParticipante = "invitado" | "admin" | "solicitante";

export interface PastelParticipante {
  id: string;
  nombre: string | null;
  participa: boolean;
  origen: OrigenParticipante;
  createdAt: string;
}

export interface PastelCompartido {
  id: string;
  ordenId: string;
  ordenItemId: string;
  token: string;
  solicitanteNombre: string | null;
  productoNombre: string | null;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  /** Todas las respuestas (participa y no participa), en orden de llegada. */
  participantes: PastelParticipante[];
  createdAt: string;
}

/** Vista pública del enlace — solo lo que necesita la página de invitación. */
export interface PastelCompartidoPublico {
  solicitanteNombre: string | null;
  productoNombre: string | null;
  descripcion: string | null;
  imagenUrl: string | null;
  esGelatina: boolean;
  activo: boolean;
}

export const NOMBRE_PARTICIPANTE_MAX = 80;

/** Quienes sí participan, con el solicitante primero. */
export function participantesActivos(
  participantes: PastelParticipante[],
): PastelParticipante[] {
  return participantes
    .filter((p) => p.participa)
    .sort((a, b) => {
      if (a.origen === "solicitante" && b.origen !== "solicitante") return -1;
      if (b.origen === "solicitante" && a.origen !== "solicitante") return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

/**
 * Reparte `total` en `n` pagos iguales al centavo. Los centavos que sobran se
 * suman a los primeros pagos, así la suma siempre es exactamente el total.
 */
export function repartirMonto(total: number, n: number): number[] {
  if (n <= 0) return [];
  const centavos = Math.round(total * 100);
  const base = Math.floor(centavos / n);
  const resto = centavos - base * n;
  return Array.from({ length: n }, (_, i) => (base + (i < resto ? 1 : 0)) / 100);
}

// ── Descripción automática ───────────────────────────────────────────────────

interface SeleccionConf {
  coberturaId?: string | null;
  saborCoberturaId?: string | null;
  rellenoId?: string | null;
  saborRellenoId?: string | null;
  ingredienteId?: string | null;
}

/** Campos de `orden_items.configuracion` que guarda "Arma tu pedido" (pastel o gelatina). */
export interface ConfigCompartible {
  tipo?: string;
  compartir?: boolean;
  bizcochoId?: string | null;
  diametroCm?: number | null;
  coberturas?: SeleccionConf[];
  rellenos?: SeleccionConf[];
  toppings?: SeleccionConf[];
  jarabeId?: string | null;
  saborJarabeId?: string | null;
  categoria?: string;
  litrosAgua?: number;
  litrosLeche?: number;
  litrosTresLeches?: number;
  litrosQuesoCrema?: number;
  litrosYogurt?: number;
  fotoRef?: string | null;
  datos?: { nombre?: string | null } | null;
}

/** Catálogo mínimo (id → nombre) para describir la configuración guardada. */
export interface NombresCatalogo {
  bizcochos: Record<string, string>;
  coberturas: Record<string, string>;
  sabores: Record<string, string>;
  jarabes: Record<string, string>;
  saboresJarabe: Record<string, string>;
  ingredientes: Record<string, string>;
}

/** Nombre de catálogo en minúscula para usarlo dentro de una frase ("Tres Leches" → "tres leches"). */
const minus = (s: string) => {
  if (!s) return s;
  const palabras = s.split(" ");
  const tituloCompleto = palabras.length > 1 && palabras.every((w) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]/.test(w));
  return tituloCompleto ? s.toLowerCase() : s.charAt(0).toLowerCase() + s.slice(1);
};

function lista(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function conSabor(nombre: string | undefined, sabor: string | undefined) {
  if (!nombre) return null;
  return sabor ? `${minus(nombre)} sabor ${minus(sabor)}` : minus(nombre);
}

/**
 * Frase que resalta los ingredientes principales de un pastel o gelatina de
 * "Arma tu pedido", a partir de su `configuracion` guardada en la orden.
 */
export function describirProductoCompartido(
  conf: ConfigCompartible,
  nombres: NombresCatalogo,
  personas: number | null,
): string {
  const nombre = (dict: Record<string, string>, id: string | null | undefined) =>
    id ? dict[id] : undefined;
  const coberturas = (conf.coberturas ?? [])
    .map((c) => conSabor(nombre(nombres.coberturas, c.coberturaId), nombre(nombres.sabores, c.saborCoberturaId)))
    .filter((x): x is string => !!x);
  const rellenos = (conf.rellenos ?? [])
    .map((r) => conSabor(nombre(nombres.coberturas, r.rellenoId), nombre(nombres.sabores, r.saborRellenoId)))
    .filter((x): x is string => !!x);
  const jarabe = conSabor(nombre(nombres.jarabes, conf.jarabeId), nombre(nombres.saboresJarabe, conf.saborJarabeId));
  const toppings = (conf.toppings ?? [])
    .map((t) => nombre(nombres.ingredientes, t.ingredienteId))
    .filter((x): x is string => !!x)
    .map(minus);

  const partes: string[] = [];

  if (conf.tipo === "gelatina-custom") {
    const bases: string[] = [];
    if ((conf.litrosAgua ?? 0) > 0) bases.push("agua");
    if ((conf.litrosLeche ?? 0) > 0) bases.push("leche");
    if ((conf.litrosTresLeches ?? 0) > 0) bases.push("tres leches");
    if ((conf.litrosQuesoCrema ?? 0) > 0) bases.push("queso crema");
    if ((conf.litrosYogurt ?? 0) > 0) bases.push("yogurt");
    const categoria =
      conf.categoria === "healthy" ? " healthy" : conf.categoria === "sin_azucar" ? " sin azúcar" : "";
    partes.push(
      `Una gelatina${categoria}${bases.length ? ` de ${lista(bases)}` : ""}`,
    );
  } else {
    const bizcocho = nombre(nombres.bizcochos, conf.bizcochoId);
    partes.push(
      `Un pastel${personas ? ` para ${personas} personas` : ""}${bizcocho ? ` de bizcocho de ${minus(bizcocho)}` : ""}`,
    );
    if (rellenos.length) partes.push(`relleno de ${lista(rellenos)}`);
  }

  const o = conf.tipo === "gelatina-custom" ? "a" : "o";
  if (coberturas.length) partes.push(`cubiert${o} de ${lista(coberturas)}`);
  if (jarabe) partes.push(`bañad${o} en jarabe de ${jarabe}`);
  if (toppings.length) partes.push(`decorad${o} con ${lista(toppings)}`);

  // Con 3+ partes la última va con "y"; con 2 basta una coma (evita "agua y leche y decorada").
  const frase = partes.length > 2
    ? `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`
    : partes.join(", ");
  return `${frase}.`;
}
