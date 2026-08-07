// src/modules/admin/raws/domain/entities/Ornamento.entity.ts

export interface Ornamento {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrnamentoDTO {
  nombre: string;
  precio: number;
  imagenUrl?: string | null;
}

export type UpdateOrnamentoDTO = Partial<CreateOrnamentoDTO>;
