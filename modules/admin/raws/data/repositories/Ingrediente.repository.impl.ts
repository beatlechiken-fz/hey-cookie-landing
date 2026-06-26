// src/modules/admin/store/data/repositories/Ingrediente.repository.impl.ts

import type {
  IngredienteRepository,
  ToppingRepository,
  IngredienteFilters,
  PaginatedResult,
} from "../../domain/repositories/Ingrediente.repository";
import type {
  Ingrediente,
  CreateIngredienteDTO,
  UpdateIngredienteDTO,
  ToppingCantidad,
  UpsertToppingCantidadDTO,
} from "../../domain/entities/Ingrediente.entity";
import { IngredienteSupabaseDatasource } from "../datasources/IngredienteSupabase.datasource";

const ds = new IngredienteSupabaseDatasource();

export class IngredienteRepositoryImpl implements IngredienteRepository {
  findAll(f: IngredienteFilters): Promise<PaginatedResult<Ingrediente>> {
    return ds.findAll(f);
  }
  findById(id: string): Promise<Ingrediente | null> {
    return ds.findById(id);
  }
  create(dto: CreateIngredienteDTO): Promise<Ingrediente> {
    return ds.create(dto);
  }
  update(id: string, dto: UpdateIngredienteDTO): Promise<Ingrediente> {
    return ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return ds.delete(id);
  }
  setTopping(id: string, value: boolean): Promise<Ingrediente> {
    return ds.setTopping(id, value);
  }
}

export class ToppingRepositoryImpl implements ToppingRepository {
  findAll(): Promise<ToppingCantidad[]> {
    return ds.findAllToppings();
  }
  upsert(dto: UpsertToppingCantidadDTO): Promise<ToppingCantidad> {
    return ds.upsertTopping(dto);
  }
  removeTopping(ingredienteId: string): Promise<void> {
    return ds.removeTopping(ingredienteId);
  }
}

// ── Licor Repository Impl ─────────────────────────────────────────────────────

import type { LicorRepository } from "../../domain/repositories/Ingrediente.repository";
import type {
  LicorCantidad,
  UpsertLicorCantidadDTO,
} from "../../domain/entities/Ingrediente.entity";
import { LicorCantidadSupabaseDatasource } from "../datasources/IngredienteSupabase.datasource";

export class LicorRepositoryImpl implements LicorRepository {
  private ds = new LicorCantidadSupabaseDatasource();
  findAll(): Promise<LicorCantidad[]> {
    return this.ds.findAll();
  }
  upsert(dto: UpsertLicorCantidadDTO): Promise<LicorCantidad> {
    return this.ds.upsert(dto);
  }
}
