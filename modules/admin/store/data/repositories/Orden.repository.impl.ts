// src/modules/admin/store/data/repositories/Orden.repository.impl.ts

import type { OrdenRepository } from "../../domain/repositories/Orden.repository";
import type {
  Orden,
  CreateOrdenDTO,
  OrdenStatus,
  UpdateOrdenItemDTO,
} from "../../domain/entities/Orden.entity";
import {
  OrdenSupabaseDatasource,
  type OrdenFilters,
  type PaginatedResult,
} from "../datasources/Orden.datasource";

export class OrdenRepositoryImpl implements OrdenRepository {
  private ds = new OrdenSupabaseDatasource();

  findAll(filters: OrdenFilters): Promise<PaginatedResult<Orden>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Orden | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateOrdenDTO): Promise<Orden> {
    return this.ds.create(dto);
  }
  updateStatus(id: string, status: OrdenStatus): Promise<Orden> {
    return this.ds.updateStatus(id, status);
  }
  updateFechaEntrega(id: string, fecha: string | null): Promise<Orden> {
    return this.ds.updateFechaEntrega(id, fecha);
  }
  updateItem(ordenId: string, itemId: string, dto: UpdateOrdenItemDTO): Promise<Orden> {
    return this.ds.updateItem(ordenId, itemId, dto);
  }
  removeItem(ordenId: string, itemId: string): Promise<Orden> {
    return this.ds.removeItem(ordenId, itemId);
  }
}
