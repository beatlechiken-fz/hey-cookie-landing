// src/modules/admin/store/domain/entities/Bizcocho.entity.ts

export interface BizcochoIngrediente {
  id: string;
  bizcochoId: string;
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  cantidad: number;
  costoCalculado: number | null;
}

export interface Bizcocho {
  id: string;
  nombre: string;
  descripcion: string | null;
  elaboracion: string | null;
  costoTotal: number;
  activo: boolean;
  ingredientes: BizcochoIngrediente[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBizcochoIngredienteDTO {
  ingredienteId: string;
  cantidad: number;
}

export interface CreateBizcochoDTO {
  nombre: string;
  descripcion?: string | null;
  elaboracion?: string | null;
  ingredientes: CreateBizcochoIngredienteDTO[];
}

export type UpdateBizcochoDTO = Partial<CreateBizcochoDTO>;
