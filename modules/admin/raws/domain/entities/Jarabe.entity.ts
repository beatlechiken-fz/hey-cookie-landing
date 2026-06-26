// src/modules/admin/raws/domain/entities/Jarabe.entity.ts

export interface JarabeIngrediente {
  id: string;
  jarabeId: string;
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  cantidad: number;
  costoCalculado: number | null;
}

export interface Jarabe {
  id: string;
  nombre: string;
  descripcion: string | null;
  elaboracion: string | null;
  costoTotal: number;
  activo: boolean;
  ingredientes: JarabeIngrediente[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJarabeIngredienteDTO {
  ingredienteId: string;
  cantidad: number;
}

export interface CreateJarabeDTO {
  nombre: string;
  descripcion?: string | null;
  elaboracion?: string | null;
  ingredientes: CreateJarabeIngredienteDTO[];
}

export type UpdateJarabeDTO = Partial<CreateJarabeDTO>;

// ── Sabor de Jarabe ───────────────────────────────────────────────────────────

export interface SaborJarabe {
  id: string;
  nombre: string;
  precio: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaborJarabeDTO {
  nombre: string;
  precio?: number | null;
}

export type UpdateSaborJarabeDTO = Partial<CreateSaborJarabeDTO>;
