// src/modules/admin/store/domain/entities/Empaque.entity.ts

export interface Empaque {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpaqueDTO {
  nombre: string;
  precio: number;
  imagenUrl?: string | null;
}

export type UpdateEmpaqueDTO = Partial<CreateEmpaqueDTO>;
