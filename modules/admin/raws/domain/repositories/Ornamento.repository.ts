// src/modules/admin/raws/domain/repositories/Ornamento.repository.ts

import type {
  Ornamento,
  CreateOrnamentoDTO,
  UpdateOrnamentoDTO,
} from "../entities/Ornamento.entity";

export interface OrnamentoFilters {
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

export interface OrnamentoRepository {
  findAll(filters: OrnamentoFilters): Promise<PaginatedResult<Ornamento>>;
  findById(id: string): Promise<Ornamento | null>;
  create(dto: CreateOrnamentoDTO): Promise<Ornamento>;
  update(id: string, dto: UpdateOrnamentoDTO): Promise<Ornamento>;
  delete(id: string): Promise<void>;
}
