// src/modules/admin/store/domain/entities/PastelPersonalizado.entity.ts

// ── Constantes de referencia ──────────────────────────────────────────────────

/** Diámetro base sobre el que están registradas todas las recetas (bizcochos, coberturas, jarabes) */
export const DIAMETRO_BASE_CM = 24;

/** Altura del molde, constante para todos los diámetros */
export const ALTURA_MOLDE_CM = 7;

/**
 * Factor de escalado de volumen entre el diámetro solicitado y el diámetro base.
 *
 * Justificación (repostería + cálculo de costos):
 * El volumen de un molde cilíndrico es V = π · r² · h.
 * Como la altura (h = 7cm) se mantiene constante para todos los diámetros,
 * la relación de volúmenes se simplifica a:
 *
 *   V_nuevo / V_base = (r_nuevo² · h) / (r_base² · h) = (d_nuevo / d_base)²
 *
 * Por lo tanto, todas las cantidades de ingredientes (y por extensión sus costos,
 * ya que costo = cantidad × costo_unitario) deben multiplicarse por:
 *
 *   factor = (diametro_solicitado / 24)²
 *
 * Ejemplos:
 *   15cm → factor ≈ 0.3906  (39.06% de los insumos de la receta base)
 *   20cm → factor ≈ 0.6944
 *   24cm → factor = 1.0000  (receta base, sin cambios)
 *   28cm → factor ≈ 1.3611
 *   30cm → factor ≈ 1.5625
 */
export function calcularFactorVolumen(diametroCm: number): number {
  if (diametroCm <= 0) return 0;
  return Math.pow(diametroCm / DIAMETRO_BASE_CM, 2);
}

/**
 * Factor de volumen relativo a una medida base arbitraria (usado por
 * productos del catálogo cuya receta está registrada a 24cm, 22cm, etc.
 * en lugar de la base fija de 24cm del pastel personalizado).
 *
 *   factor = (diametroSolicitado / medidaBaseCm)²
 *
 * Esto se trata como un círculo equivalente independientemente de la forma
 * real del producto (rosca, rectangular, etc.) — es una aproximación de
 * escalado de receta, no una medida geométrica exacta.
 */
export function calcularFactorVolumenRelativo(
  diametroCm: number,
  medidaBaseCm: number,
): number {
  if (diametroCm <= 0 || medidaBaseCm <= 0) return 0;
  return Math.pow(diametroCm / medidaBaseCm, 2);
}

// ── Opciones disponibles para el configurador (catálogo) ─────────────────────

export interface OpcionSimple {
  id: string;
  nombre: string;
  costoTotal: number; // costo a 24cm (base); se escala por factor al calcular
  imagenUrl?: string | null;
}

export interface OpcionSabor {
  id: string;
  nombre: string;
  precio: number | null; // precio adicional fijo, NO se escala por tamaño
}

export interface OpcionToppingCantidad {
  ingredienteId: string;
  nombre: string;
  cantidad: number | null; // cantidad a 24cm
  unidad: string;
  costoUnidadMinima: number | null;
  imagenUrl?: string | null;
}

export interface OpcionLicorCantidad {
  ingredienteId: string;
  nombre: string;
  cantidad: number | null; // ml a 24cm
  costoUnidadMinima: number | null;
  imagenUrl?: string | null;
}

export interface OpcionEmpaque {
  id: string;
  nombre: string;
  precio: number; // precio fijo, NO se escala por tamaño
  imagenUrl: string | null;
}

export interface OpcionOrnamento {
  id: string;
  nombre: string;
  precio: number; // precio fijo, NO se escala por tamaño
  imagenUrl: string | null;
}

/** Catálogo completo que el endpoint /api/admin/pastel-config devuelve para alimentar el configurador */
export interface PastelConfigCatalogo {
  bizcochos: OpcionSimple[];
  coberturas: OpcionSimple[];
  saboresCobertura: OpcionSabor[];
  jarabes: OpcionSimple[];
  saboresJarabe: OpcionSabor[];
  toppings: OpcionToppingCantidad[];
  licores: OpcionLicorCantidad[];
  empaques: OpcionEmpaque[];
  ornamentos: OpcionOrnamento[];
}

// ── Configuración elegida por el usuario ──────────────────────────────────────

/**
 * Nivel de humedad del pastel cuando se usa jarabe.
 * - semi_humedo: cantidades del jarabe sin modificar (comportamiento actual)
 * - humedo: todas las cantidades de ingredientes del jarabe × 2.2 (más calado)
 */
export type HumedadJarabe = "semi_humedo" | "humedo";

/** Una cobertura exterior seleccionada (puede haber varias, todas suman al precio) */
export interface CoberturaSeleccionada {
  coberturaId: string;
  saborCoberturaId: string | null;
}

/** Un relleno (= otra cobertura usada como capa interna) seleccionado */
export interface RellenoSeleccionado {
  rellenoId: string; // referencia a coberturas
  saborRellenoId: string | null;
}

/** Un ornamento seleccionado con cuántas piezas de ese ornamento lleva el pastel */
export interface OrnamentoSeleccionado {
  ornamentoId: string;
  cantidad: number;
}

export interface PastelConfiguracion {
  diametroCm: number;
  bizcochoId: string | null;
  coberturas: CoberturaSeleccionada[]; // varias coberturas exteriores, todas suman al precio
  rellenos: RellenoSeleccionado[]; // varios rellenos (otras coberturas), todos suman al precio
  toppingIds: string[]; // ingrediente_id[] de topping_cantidades
  jarabeId: string | null;
  saborJarabeId: string | null;
  humedadJarabe: HumedadJarabe | null; // null = sin jarabe / no aplica
  licorId: string | null; // ingrediente_id de licor_cantidades
  empaqueIds: string[];
  ornamentos: OrnamentoSeleccionado[];
  cantidad: number;
}

export const CONFIGURACION_VACIA: PastelConfiguracion = {
  diametroCm: DIAMETRO_BASE_CM,
  bizcochoId: null,
  coberturas: [],
  rellenos: [],
  toppingIds: [],
  jarabeId: null,
  saborJarabeId: null,
  humedadJarabe: null,
  licorId: null,
  empaqueIds: [],
  ornamentos: [],
  cantidad: 1,
};

/**
 * Traductor de compatibilidad: hay órdenes/productos reales guardados con el
 * formato viejo (coberturaId/rellenoId singulares, ornamentoIds sin cantidad).
 * Convierte cualquier `opciones`/`configuracion` leído de BD al formato nuevo
 * (arrays), sin tocar nada que ya venga en formato nuevo. Es el único lugar
 * del código con lógica de compatibilidad — todo lo demás (usecases, UI)
 * asume el shape nuevo.
 */
export function normalizeOpciones<T extends Record<string, any>>(
  raw: T | null | undefined,
): T {
  const r: Record<string, any> = { ...(raw ?? {}) };

  if (!Array.isArray(r.coberturas)) {
    r.coberturas = r.coberturaId
      ? [{ coberturaId: r.coberturaId, saborCoberturaId: r.saborCoberturaId ?? null }]
      : [];
  }
  delete r.coberturaId;
  delete r.saborCoberturaId;

  if (!Array.isArray(r.rellenos)) {
    r.rellenos = r.rellenoId
      ? [{ rellenoId: r.rellenoId, saborRellenoId: r.saborRellenoId ?? null }]
      : [];
  }
  delete r.rellenoId;
  delete r.saborRellenoId;

  if (!Array.isArray(r.ornamentos)) {
    const legacyIds: string[] = Array.isArray(r.ornamentoIds) ? r.ornamentoIds : [];
    r.ornamentos = legacyIds
      .filter((id) => id && id !== "ninguno")
      .map((ornamentoId) => ({ ornamentoId, cantidad: 1 }));
  }
  delete r.ornamentoIds;

  return r as T;
}

// ── Desglose de costos calculado ──────────────────────────────────────────────

export interface CostoLineaItem {
  concepto: string; // ej: "Bizcocho: Vainilla Ligero"
  detalle?: string; // ej: "Factor 0.69 (20cm)"
  costoBase: number; // costo a 24cm (antes de escalar), null para fijos
  factorAplicado: number; // 1 si no escala (sabores/empaques son fijos)
  costoFinal: number; // costoBase * factorAplicado
}

/** Cargo adicional calculado sobre una base de costos (ej. mano de obra, decoración) */
export interface CargoAdicional {
  concepto: string; // ej: "Mano de obra (10% bizcocho+cobertura+relleno)"
  base: number; // monto base sobre el que se calculó el cargo
  porcentaje: number; // porcentaje aplicado (informativo)
  monto: number; // monto final del cargo
}

export interface PastelCostoDesglose {
  factorVolumen: number;
  items: CostoLineaItem[];
  costoInsumos: number; // suma de todos los costoFinal (= costo de insumos puros)
  cargosAdicionales: CargoAdicional[]; // cargos de mano de obra / decoración / armado
  costoProduccionTotal: number; // costoInsumos + suma de cargosAdicionales
  precioSugerido: number; // = costoProduccionTotal (precio final de venta)
}
