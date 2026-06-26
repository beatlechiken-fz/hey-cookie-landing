// src/modules/admin/store/domain/entities/GelatinaCotizador.entity.ts
//
// Entidad para cotizar gelatinas personalizadas.
// A diferencia del pastel, la gelatina tiene DOS recetas base independientes
// (base_leche y base_agua) y el usuario configura litros de cada una.
//
// Costo receta = (litrosLeche × costoTotalLeche) + (litrosAgua × costoTotalAgua)
// Factor opciones = totalLitros × FACTOR_POR_LITRO
// Las opciones del catálogo (cobertura, relleno, etc.) están en base 24cm.
// Por cada litro de gelatina el factor es 0.5.

export const FACTOR_GELATINA_POR_LITRO = 0.5;

export interface GelatinaCatalogo {
  id: string;
  nombre: string;
  descripcion: string | null;
  elaboracion: string | null;
  costoTotalLeche: number; // costo de 1L de base leche
  costoTotalAgua: number; // costo de 1L de base agua
  tieneBaseLeche: boolean;
  tieneBaseAgua: boolean;
  activo: boolean;
}

export interface GelatinaCotizadorConfig {
  gelatinaId: string;
  litrosLeche: number; // puede ser 0 si solo se pide base agua
  litrosAgua: number; // puede ser 0 si solo se pide base leche
  // Opciones del catálogo (mismas que el pastel)
  coberturaId: string | null;
  saborCoberturaId: string | null;
  rellenoId: string | null;
  saborRellenoId: string | null;
  toppingIds: string[];
  jarabeId: string | null;
  saborJarabeId: string | null;
  licorId: string | null;
  empaqueIds: string[];
  // Extras exclusivos de gelatina
  conTransfer: boolean;
  conBlonda: boolean;
  cantidad: number;
}

export const GELATINA_CONFIG_VACIA: GelatinaCotizadorConfig = {
  gelatinaId: "",
  litrosLeche: 1,
  litrosAgua: 0,
  coberturaId: null,
  saborCoberturaId: null,
  rellenoId: null,
  saborRellenoId: null,
  toppingIds: [],
  jarabeId: null,
  saborJarabeId: null,
  licorId: null,
  empaqueIds: [],
  conTransfer: false,
  conBlonda: false,
  cantidad: 1,
};

// ── Desglose de costos ────────────────────────────────────────────────────────

export interface GelatinaCostoDesglose {
  litrosLeche: number;
  litrosAgua: number;
  totalLitros: number;
  factorOpciones: number; // totalLitros × 0.5

  // Receta base
  costoBaseLeche: number; // litrosLeche × costoTotalLeche
  costoBaseAgua: number; // litrosAgua  × costoTotalAgua
  costoBaseTotal: number; // suma de ambas bases

  // Extras del catálogo (escalados por factorOpciones)
  costoCobertura: number;
  costoRelleno: number;
  costoJarabe: number;
  costoToppings: number;
  costoLicor: number;
  costoEmpaques: number;
  costoTransfer: number;
  costoBlonda: number;

  costoInsumos: number; // suma de todo lo anterior

  // Cargos adicionales (misma lógica que el pastel)
  servicios: number; // 10% de baseEstructural
  manoDeObra: number; // max(60, 25% de baseEstructural)
  utilidad: number; // 90% de baseConOpciones

  costoProduccionTotal: number;
  precioSugerido: number;
}
