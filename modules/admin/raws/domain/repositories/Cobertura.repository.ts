// src/features/coberturas/domain/repositories/CoberturaRepository.ts

import type {
  Cobertura,
  CreateCoberturaDTO,
  UpdateCoberturaDTO,
  Sabor,
  CreateSaborDTO,
  UpdateSaborDTO,
} from "../entities/Cobertura.entity";

export interface CoberturaFilters {
  search?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SaborFilters {
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

export interface CoberturaRepository {
  findAll(filters: CoberturaFilters): Promise<PaginatedResult<Cobertura>>;
  findById(id: string): Promise<Cobertura | null>;
  create(dto: CreateCoberturaDTO): Promise<Cobertura>;
  update(id: string, dto: UpdateCoberturaDTO): Promise<Cobertura>;
  delete(id: string): Promise<void>;
}

export interface SaborRepository {
  findAll(filters: SaborFilters): Promise<PaginatedResult<Sabor>>;
  findById(id: string): Promise<Sabor | null>;
  create(dto: CreateSaborDTO): Promise<Sabor>;
  update(id: string, dto: UpdateSaborDTO): Promise<Sabor>;
  delete(id: string): Promise<void>;
}
