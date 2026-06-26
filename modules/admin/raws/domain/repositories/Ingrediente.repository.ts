// src/modules/admin/store/domain/repositories/Ingrediente.repository.ts

import type {
  Ingrediente,
  CreateIngredienteDTO,
  UpdateIngredienteDTO,
  ToppingCantidad,
  UpsertToppingCantidadDTO,
  CategoriaIngrediente,
} from "../entities/Ingrediente.entity";

export interface IngredienteFilters {
  search?: string;
  unidadBase?: string;
  categoria?: CategoriaIngrediente;
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

export interface IngredienteRepository {
  findAll(filters: IngredienteFilters): Promise<PaginatedResult<Ingrediente>>;
  findById(id: string): Promise<Ingrediente | null>;
  create(dto: CreateIngredienteDTO): Promise<Ingrediente>;
  update(id: string, dto: UpdateIngredienteDTO): Promise<Ingrediente>;
  delete(id: string): Promise<void>;
  // Topping toggle
  setTopping(id: string, value: boolean): Promise<Ingrediente>;
}

export interface ToppingRepository {
  findAll(): Promise<ToppingCantidad[]>;
  upsert(dto: UpsertToppingCantidadDTO): Promise<ToppingCantidad>;
  removeTopping(ingredienteId: string): Promise<void>; // quita topping=false + borra cantidad
}

// ── Licor Repository ──────────────────────────────────────────────────────────

import type {
  LicorCantidad,
  UpsertLicorCantidadDTO,
} from "../entities/Ingrediente.entity";

export interface LicorRepository {
  findAll(): Promise<LicorCantidad[]>;
  upsert(dto: UpsertLicorCantidadDTO): Promise<LicorCantidad>;
}
