// src/modules/admin/store/data/repositories/Cashback.repository.impl.ts

import type { CashbackRepository } from "../../domain/repositories/Cashback.repository";
import type { TipoMovimientoCashback } from "../../domain/entities/Cashback.entity";
import { CashbackSupabaseDatasource } from "../datasources/CashbackSupabase.datasource";

export class CashbackRepositoryImpl implements CashbackRepository {
  private ds = new CashbackSupabaseDatasource();

  estadoDeCliente(clienteId: string) {
    return this.ds.estadoDeCliente(clienteId);
  }
  movimientosDeOrden(ordenId: string) {
    return this.ds.movimientosDeOrden(ordenId);
  }
  registrarDeOrden(
    clienteId: string,
    ordenId: string,
    tipo: TipoMovimientoCashback,
    monto: number,
    descripcion: string,
  ) {
    return this.ds.registrarDeOrden(clienteId, ordenId, tipo, monto, descripcion);
  }
  aplicarAOrden(clienteId: string, ordenId: string, maximo: number) {
    return this.ds.aplicarAOrden(clienteId, ordenId, maximo);
  }
}
