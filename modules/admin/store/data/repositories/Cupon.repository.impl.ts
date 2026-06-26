// src/modules/admin/store/data/repositories/Cupon.repository.impl.ts

import type { CuponRepository } from "../../domain/repositories/Cupon.repository";
import type {
  Cupon,
  CreateCuponDTO,
  UpdateCuponDTO,
} from "../../domain/entities/Cupon.entity";
import {
  CuponSupabaseDatasource,
  type CuponFilters,
  type PaginatedResult,
} from "../datasources/Cupon.datasource";

export class CuponRepositoryImpl implements CuponRepository {
  private ds = new CuponSupabaseDatasource();

  findAll(filters: CuponFilters): Promise<PaginatedResult<Cupon>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Cupon | null> {
    return this.ds.findById(id);
  }
  findByCodigo(codigo: string): Promise<Cupon | null> {
    return this.ds.findByCodigo(codigo);
  }
  create(dto: CreateCuponDTO): Promise<Cupon> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateCuponDTO): Promise<Cupon> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
  incrementarUso(id: string): Promise<void> {
    return this.ds.incrementarUso(id);
  }

  findAsignadosByCliente(clienteId: string): Promise<Cupon[]> {
    return this.ds.findAsignadosByCliente(clienteId);
  }
  findDisponiblesParaCliente(
    clienteId: string,
    search?: string,
  ): Promise<Cupon[]> {
    return this.ds.findDisponiblesParaCliente(clienteId, search);
  }
  asignarACliente(cuponId: string, clienteId: string): Promise<void> {
    return this.ds.asignarACliente(cuponId, clienteId);
  }
  desasignarDeCliente(cuponId: string, clienteId: string): Promise<void> {
    return this.ds.desasignarDeCliente(cuponId, clienteId);
  }
  estaAsignado(cuponId: string, clienteId: string): Promise<boolean> {
    return this.ds.estaAsignado(cuponId, clienteId);
  }
  marcarUsadoPorCliente(cuponId: string, clienteId: string): Promise<void> {
    return this.ds.marcarUsadoPorCliente(cuponId, clienteId);
  }
}
