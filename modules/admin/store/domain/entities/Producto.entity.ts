// src/modules/admin/productos/domain/entities/Producto.entity.ts

import type { PastelConfiguracion } from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";

export type LineaProducto = "sweet" | "fitness" | "healthy";
export type CategoriaProducto = "cookie" | "pastel" | "gelatina" | "dessert";

/** Línea de receta congelada (snapshot) que representa el "bizcocho" del producto */
export interface IngredienteBaseItem {
  ingredienteId: string;
  nombre: string;
  cantidad: number; // a medida_base_cm (o tamaño único)
  unidad: "gr" | "ml" | "pieza" | "piezas";
  costoUnidadMinima: number; // costo por gr/ml/pieza, snapshot al momento de crear el producto
}

/**
 * Opciones configurables de un producto — mismas que PastelConfiguracion
 * MENOS bizcochoId (fijo, viene de ingredientes_base) y diametroCm
 * (se captura aparte solo si permite_medida_personalizada).
 */
export type ProductoOpciones = Omit<
  PastelConfiguracion,
  "bizcochoId" | "diametroCm" | "cantidad"
>;

export const OPCIONES_VACIAS: ProductoOpciones = {
  coberturaId: null,
  saborCoberturaId: null,
  rellenoId: null,
  saborRellenoId: null,
  toppingIds: [],
  jarabeId: null,
  saborJarabeId: null,
  humedadJarabe: null,
  licorId: null,
  empaqueIds: [],
};

/** Variante de tamaño fijo (ej. Panna Cotta: Vaso grande / Vaso chico) */
export interface TamanoFijo {
  id: string; // slug único dentro del producto, ej. "vaso_grande"
  nombre: string; // "Vaso grande"
  factorCosto: number; // multiplicador sobre el costo de ingredientes_base (1 = igual)
  /**
   * Factor que se aplica a las opciones del catálogo (cobertura, relleno,
   * jarabe, toppings, licor) para este tamaño.
   * Las opciones del catálogo están calculadas a 24cm; este factor las escala
   * al tamaño real del producto.
   * Ejemplos:
   *   - Panna Cotta vaso grande: factorOpciones = 1/6  (~0.1667, porción individual)
   *   - Panna Cotta vaso chico:  factorOpciones = 1/10 (0.1)
   *   - Crème brûlée 8cm:        factorOpciones = (8/24)² ≈ 0.1111
   *   - Mini pavlova individual: factorOpciones = 1/20  (0.05)
   *   - Muffin individual:       factorOpciones = 1/6   (~0.1667)
   * Si no se especifica, se hereda el factorOpciones del Producto.
   */
  factorOpciones?: number | null;
  /** Si la variante tiene su propia receta en vez de escalar por factor */
  ingredientesOverride?: IngredienteBaseItem[] | null;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  linea: LineaProducto;
  categoria: CategoriaProducto | null;
  elaboracion: string | null;

  ingredientesBase: IngredienteBaseItem[];
  opcionesDefault: ProductoOpciones;

  medidaBaseCm: number | null;
  permiteMedidaPersonalizada: boolean;

  tamanosFijos: TamanoFijo[];

  /**
   * Factor que se aplica a las opciones del catálogo (cobertura, relleno,
   * jarabe, toppings, licor) cuando el producto tiene medida personalizable.
   * Para pasteles redondos normales este factor = factorVolumen (se calcula
   * automáticamente del diámetro). Para productos con tamaño único sin
   * medida personalizable, este campo permite override manual.
   * NULL = usar el mismo factor que la receta base (comportamiento default).
   */
  factorOpciones: number | null;

  /**
   * Mínimo de mano de obra en pesos (Cargo 2 = max(manoDeObraMinimo, 25% baseEstructura)).
   * NULL = usar el default global de $60 (pasteles estándar).
   * Productos individuales tienen mínimos más bajos:
   *   tarta sablé $45, panna cotta $20, crème brûlée $30, pavlova $5, muffin $10
   */
  manoDeObraMinimo: number | null;
  precioEstablecido: number | null;

  activo: boolean;
  orden: number;

  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoDTO {
  nombre: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  linea: LineaProducto;
  categoria?: CategoriaProducto | null;
  elaboracion?: string | null;
  ingredientesBase: IngredienteBaseItem[];
  opcionesDefault: ProductoOpciones;
  medidaBaseCm?: number | null;
  permiteMedidaPersonalizada?: boolean;
  tamanosFijos?: TamanoFijo[];
  factorOpciones?: number | null;
  manoDeObraMinimo?: number | null;
  precioEstablecido?: number | null;
  activo?: boolean;
  orden?: number;
}

export type UpdateProductoDTO = Partial<CreateProductoDTO>;

/** Resumen para tarjetas de catálogo (sin desglose de receta) */
export interface ProductoResumen {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  linea: LineaProducto;
  activo: boolean;
  permiteMedidaPersonalizada: boolean;
  medidaBaseCm: number | null;
  tieneTamanosFijos: boolean;
}

export function toProductoResumen(p: Producto): ProductoResumen {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    imagenUrl: p.imagenUrl,
    linea: p.linea,
    activo: p.activo,
    permiteMedidaPersonalizada: p.permiteMedidaPersonalizada,
    medidaBaseCm: p.medidaBaseCm,
    tieneTamanosFijos: p.tamanosFijos.length > 0,
  };
}
