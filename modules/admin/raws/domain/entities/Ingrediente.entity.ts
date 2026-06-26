// src/modules/admin/store/domain/entities/Ingrediente.entity.ts

export type UnidadBase = "gr" | "ml" | "pieza" | "piezas";

export type CategoriaIngrediente =
  | "lacteos"
  | "harinas_cereales"
  | "endulzantes"
  | "chocolates"
  | "frutas"
  | "frutos_secos"
  | "especias_aromas"
  | "mermeladas_confituras"
  | "grasas_aceites"
  | "licores_bebidas"
  | "aditivos_quimicos"
  | "galletas_bases"
  | "empaques"
  | "otros";

export const CATEGORIAS: { value: CategoriaIngrediente; label: string }[] = [
  { value: "lacteos", label: "Lácteos y huevos" },
  { value: "harinas_cereales", label: "Harinas y cereales" },
  { value: "endulzantes", label: "Endulzantes" },
  { value: "chocolates", label: "Chocolates y cacao" },
  { value: "frutas", label: "Frutas y verduras" },
  { value: "frutos_secos", label: "Frutos secos" },
  { value: "especias_aromas", label: "Especias y aromas" },
  { value: "mermeladas_confituras", label: "Mermeladas y confituras" },
  { value: "grasas_aceites", label: "Grasas y aceites" },
  { value: "licores_bebidas", label: "Licores y bebidas" },
  { value: "aditivos_quimicos", label: "Aditivos y químicos" },
  { value: "galletas_bases", label: "Galletas y bases" },
  { value: "empaques", label: "Empaques y presentación" },
  { value: "otros", label: "Otros" },
];

export interface Ingrediente {
  id: string;
  nombre: string;
  categoria: CategoriaIngrediente;
  cantidadBase: number | null;
  unidadBase: UnidadBase;
  costoBase: number;
  costoKgL: number | null;
  costoUnidadMinima: number | null;
  topping: boolean; // ← nuevo
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateIngredienteDTO = Omit<
  Ingrediente,
  "id" | "costoKgL" | "costoUnidadMinima" | "activo" | "createdAt" | "updatedAt"
>;
export type UpdateIngredienteDTO = Partial<CreateIngredienteDTO>;

// ── Topping cantidad ──────────────────────────────────────────────────────────
// Cantidad de un topping para un pastel de 24cm de diámetro

export interface ToppingCantidad {
  id: string;
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  costoUnidadMinima: number | null;
  cantidad: number | null;
  unidad: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertToppingCantidadDTO {
  ingredienteId: string;
  cantidad?: number | null;
  unidad?: string | null;
  notas?: string | null;
}

// ── Licor cantidad ────────────────────────────────────────────────────────────
// Cantidad de ml de licor para un pastel de 24cm de diámetro

export interface LicorCantidad {
  id: string;
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  costoUnidadMinima: number | null;
  cantidad: number | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertLicorCantidadDTO {
  ingredienteId: string;
  cantidad?: number | null;
  notas?: string | null;
}
