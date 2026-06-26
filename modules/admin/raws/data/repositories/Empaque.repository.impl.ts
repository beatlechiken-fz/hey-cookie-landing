// src/modules/admin/store/data/repositories/Empaque.repository.impl.ts

import type {
  EmpaqueRepository,
  EmpaqueFilters,
  PaginatedResult,
} from "../../domain/repositories/Empaque.repository";
import type {
  Empaque,
  CreateEmpaqueDTO,
  UpdateEmpaqueDTO,
} from "../../domain/entities/Empaque.entity";
import { EmpaqueSupabaseDatasource } from "../datasources/EmpaqueSupabase.datasource";

export class EmpaqueRepositoryImpl implements EmpaqueRepository {
  private ds = new EmpaqueSupabaseDatasource();

  findAll(filters: EmpaqueFilters): Promise<PaginatedResult<Empaque>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Empaque | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateEmpaqueDTO): Promise<Empaque> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateEmpaqueDTO): Promise<Empaque> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
