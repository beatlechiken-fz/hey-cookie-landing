// src/modules/admin/store/data/repositories/ClienteEnlaceEdicion.repository.impl.ts

import type { ClienteEnlaceEdicionRepository } from "../../domain/repositories/ClienteEnlaceEdicion.repository";
import type { ClienteEnlaceEdicion } from "../../domain/entities/ClienteEnlaceEdicion.entity";
import { ClienteEnlaceEdicionSupabaseDatasource } from "../datasources/ClienteEnlaceEdicionSupabase.datasource";

export class ClienteEnlaceEdicionRepositoryImpl implements ClienteEnlaceEdicionRepository {
  private ds = new ClienteEnlaceEdicionSupabaseDatasource();

  findByToken(token: string) {
    return this.ds.findByToken(token);
  }
  findVigenteByCliente(clienteId: string) {
    return this.ds.findVigenteByCliente(clienteId);
  }
  findVigentesByClientes(clienteIds: string[]) {
    return this.ds.findVigentesByClientes(clienteIds);
  }
  create(clienteId: string, expiraAt: Date) {
    return this.ds.create(clienteId, expiraAt);
  }
  revocarDeCliente(clienteId: string) {
    return this.ds.revocarDeCliente(clienteId);
  }
  registrarEdicion(enlace: ClienteEnlaceEdicion, maxPorDia: number) {
    return this.ds.registrarEdicion(enlace, maxPorDia);
  }
}
