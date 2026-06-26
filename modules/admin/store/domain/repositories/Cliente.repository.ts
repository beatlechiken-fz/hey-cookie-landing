// src/modules/admin/clientes/domain/repositories/Cliente.repository.ts

import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
} from "../entities/Cliente.entity";

export interface ClienteFilters {
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

export interface ClienteRepository {
  findAll(filters: ClienteFilters): Promise<PaginatedResult<Cliente>>;
  findById(id: string): Promise<Cliente | null>;
  create(dto: CreateClienteDTO): Promise<Cliente>;
  update(id: string, dto: UpdateClienteDTO): Promise<Cliente>;
  delete(id: string): Promise<void>;
}
