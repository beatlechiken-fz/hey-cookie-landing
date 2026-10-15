// src/modules/admin/store/domain/repositories/Cashback.repository.ts

import type {
  EstadoCashback,
  MovimientoCashback,
  TipoMovimientoCashback,
} from "../entities/Cashback.entity";

export interface CashbackRepository {
  estadoDeCliente(clienteId: string): Promise<EstadoCashback>;
  movimientosDeOrden(ordenId: string): Promise<MovimientoCashback[]>;
  /** Inserta un movimiento ligado a una orden; si ya existe uno de ese tipo para la orden, no hace nada. */
  registrarDeOrden(
    clienteId: string,
    ordenId: string,
    tipo: TipoMovimientoCashback,
    monto: number,
    descripcion: string,
  ): Promise<void>;
  /** Aplica hasta `maximo` del saldo como descuento a la orden (atómico). Devuelve lo aplicado. */
  aplicarAOrden(clienteId: string, ordenId: string, maximo: number): Promise<number>;
}
