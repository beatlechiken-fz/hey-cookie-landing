// src/features/coberturas/domain/entities/Cobertura.ts

export interface CoberturaIngrediente {
  id: string;
  coberturaId: string;
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  cantidad: number;
  costoCalculado: number | null;
}

export interface Cobertura {
  id: string;
  nombre: string;
  descripcion: string | null;
  elaboracion: string | null; // procedimiento de elaboración
  costoTotal: number;
  activo: boolean;
  ingredientes: CoberturaIngrediente[];
  imagenUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoberturaIngredienteDTO {
  ingredienteId: string;
  cantidad: number;
}

export interface CreateCoberturaDTO {
  nombre: string;
  descripcion?: string | null;
  elaboracion?: string | null;
  imagenUrl?: string | null;
  ingredientes: CreateCoberturaIngredienteDTO[];
}

export type UpdateCoberturaDTO = Partial<CreateCoberturaDTO>;

// ── Sabor ─────────────────────────────────────────────────────────────────────

export interface Sabor {
  id: string;
  nombre: string;
  precio: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaborDTO {
  nombre: string;
  precio?: number | null;
}

export type UpdateSaborDTO = Partial<CreateSaborDTO>;
