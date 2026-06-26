// src/modules/admin/raws/domain/repositories/Jarabe.repository.ts

import type {
  Jarabe,
  CreateJarabeDTO,
  UpdateJarabeDTO,
} from "../entities/Jarabe.entity";
import type {
  SaborJarabe,
  CreateSaborJarabeDTO,
  UpdateSaborJarabeDTO,
} from "../entities/Jarabe.entity";

export interface JarabeFilters {
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

export interface JarabeRepository {
  findAll(filters: JarabeFilters): Promise<PaginatedResult<Jarabe>>;
  findById(id: string): Promise<Jarabe | null>;
  create(dto: CreateJarabeDTO): Promise<Jarabe>;
  update(id: string, dto: UpdateJarabeDTO): Promise<Jarabe>;
  delete(id: string): Promise<void>;
}

// ── Sabor Jarabe Repository ───────────────────────────────────────────────────

export interface SaborJarabeFilters {
  search?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SaborJarabeRepository {
  findAll(filters: SaborJarabeFilters): Promise<PaginatedResult<SaborJarabe>>;
  findById(id: string): Promise<SaborJarabe | null>;
  create(dto: CreateSaborJarabeDTO): Promise<SaborJarabe>;
  update(id: string, dto: UpdateSaborJarabeDTO): Promise<SaborJarabe>;
  delete(id: string): Promise<void>;
}
