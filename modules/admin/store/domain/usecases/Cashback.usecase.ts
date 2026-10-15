// src/modules/admin/store/domain/usecases/Cashback.usecase.ts

import type { CashbackRepository } from "../repositories/Cashback.repository";
import type { Orden } from "../entities/Orden.entity";
import { cashbackDeOrden } from "../entities/Cashback.entity";

export class GetCashbackClienteUseCase {
  constructor(private repo: CashbackRepository) {}
  execute(clienteId: string) {
    return this.repo.estadoDeCliente(clienteId);
  }
}

/** Usa el saldo del cliente como descuento en una orden recién creada. */
export class AplicarCashbackOrdenUseCase {
  constructor(private repo: CashbackRepository) {}
  async execute(clienteId: string, ordenId: string, totalOrden: number): Promise<number> {
    if (totalOrden <= 0) return 0;
    return this.repo.aplicarAOrden(clienteId, ordenId, totalOrden);
  }
}

/**
 * Mantiene el cashback de una orden en línea con su estado:
 * - pagado / entregado → abona el 3% del total pagado (una sola vez).
 * - cancelado → revierte el abono y devuelve el cashback que se usó en ella.
 * Es idempotente: se puede llamar en cada cambio de estado.
 */
export class SincronizarCashbackOrdenUseCase {
  constructor(private repo: CashbackRepository) {}
  async execute(orden: Pick<Orden, "id" | "numero" | "clienteId" | "status" | "total">): Promise<void> {
    if (!orden.clienteId) return;
    const movimientos = await this.repo.movimientosDeOrden(orden.id);
    const de = (tipo: string) => movimientos.find((m) => m.tipo === tipo);

    if ((orden.status === "pagado" || orden.status === "entregado") && !de("abono")) {
      const monto = cashbackDeOrden(orden.total);
      if (monto > 0) {
        await this.repo.registrarDeOrden(orden.clienteId, orden.id, "abono", monto,
          `3% de la orden #${orden.numero}`);
      }
      return;
    }

    if (orden.status === "cancelado") {
      const abono = de("abono");
      if (abono && !de("reverso_abono")) {
        await this.repo.registrarDeOrden(orden.clienteId, orden.id, "reverso_abono", -abono.monto,
          `Orden #${orden.numero} cancelada`);
      }
      const uso = de("uso");
      if (uso && !de("reembolso_uso")) {
        await this.repo.registrarDeOrden(orden.clienteId, orden.id, "reembolso_uso", -uso.monto,
          `Orden #${orden.numero} cancelada`);
      }
    }
  }
}
