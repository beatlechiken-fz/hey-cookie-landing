// src/modules/admin/store/domain/repositories/Bizcocho.repository.ts

import type {
  Bizcocho,
  CreateBizcochoDTO,
  UpdateBizcochoDTO,
} from "../entities/Bizcocho.entity";

export interface BizcochoFilters {
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

export interface BizcochoRepository {
  findAll(filters: BizcochoFilters): Promise<PaginatedResult<Bizcocho>>;
  findById(id: string): Promise<Bizcocho | null>;
  create(dto: CreateBizcochoDTO): Promise<Bizcocho>;
  update(id: string, dto: UpdateBizcochoDTO): Promise<Bizcocho>;
  delete(id: string): Promise<void>;
}
