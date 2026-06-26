// src/modules/admin/store/domain/repositories/Cupon.repository.ts

import type {
  Cupon,
  CreateCuponDTO,
  UpdateCuponDTO,
} from "../entities/Cupon.entity";
import type {
  CuponFilters,
  PaginatedResult,
} from "../../data/datasources/Cupon.datasource";

export interface CuponRepository {
  findAll(filters: CuponFilters): Promise<PaginatedResult<Cupon>>;
  findById(id: string): Promise<Cupon | null>;
  findByCodigo(codigo: string): Promise<Cupon | null>;
  create(dto: CreateCuponDTO): Promise<Cupon>;
  update(id: string, dto: UpdateCuponDTO): Promise<Cupon>;
  delete(id: string): Promise<void>;
  incrementarUso(id: string): Promise<void>;

  // Relación m2m cupón <-> cliente
  findAsignadosByCliente(clienteId: string): Promise<Cupon[]>;
  findDisponiblesParaCliente(
    clienteId: string,
    search?: string,
  ): Promise<Cupon[]>;
  asignarACliente(cuponId: string, clienteId: string): Promise<void>;
  desasignarDeCliente(cuponId: string, clienteId: string): Promise<void>;
  estaAsignado(cuponId: string, clienteId: string): Promise<boolean>;
  marcarUsadoPorCliente(cuponId: string, clienteId: string): Promise<void>;
}
