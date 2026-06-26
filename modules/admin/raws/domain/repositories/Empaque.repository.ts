// src/modules/admin/store/domain/repositories/Empaque.repository.ts

import type {
  Empaque,
  CreateEmpaqueDTO,
  UpdateEmpaqueDTO,
} from "../entities/Empaque.entity";

export interface EmpaqueFilters {
  search?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmpaqueRepository {
  findAll(filters: EmpaqueFilters): Promise<PaginatedResult<Empaque>>;
  findById(id: string): Promise<Empaque | null>;
  create(dto: CreateEmpaqueDTO): Promise<Empaque>;
  update(id: string, dto: UpdateEmpaqueDTO): Promise<Empaque>;
  delete(id: string): Promise<void>;
}
