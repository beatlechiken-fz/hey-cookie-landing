// src/modules/admin/store/domain/repositories/Orden.repository.ts

import type {
  Orden,
  CreateOrdenDTO,
  OrdenStatus,
} from "../entities/Orden.entity";
import type {
  OrdenFilters,
  PaginatedResult,
} from "../../data/datasources/Orden.datasource";

export interface OrdenRepository {
  findAll(filters: OrdenFilters): Promise<PaginatedResult<Orden>>;
  findById(id: string): Promise<Orden | null>;
  create(dto: CreateOrdenDTO): Promise<Orden>;
  updateStatus(id: string, status: OrdenStatus): Promise<Orden>;
  updateFechaEntrega(id: string, fechaEntrega: string | null): Promise<Orden>;
}
