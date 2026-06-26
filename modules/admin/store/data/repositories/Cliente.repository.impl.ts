// src/modules/admin/clientes/data/repositories/Cliente.repository.impl.ts

import type {
  ClienteRepository,
  ClienteFilters,
  PaginatedResult,
} from "../../domain/repositories/Cliente.repository";
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
} from "../../domain/entities/Cliente.entity";
import { ClienteSupabaseDatasource } from "../datasources/Cliente.datasource";

export class ClienteRepositoryImpl implements ClienteRepository {
  private ds = new ClienteSupabaseDatasource();

  findAll(filters: ClienteFilters): Promise<PaginatedResult<Cliente>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Cliente | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateClienteDTO): Promise<Cliente> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateClienteDTO): Promise<Cliente> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
