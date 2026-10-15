// src/modules/admin/store/domain/entities/Cashback.entity.ts

/**
 * Cashback: cada compra pagada abona un porcentaje del total como dinero
 * electrónico del cliente, que puede usar como descuento en compras futuras.
 * El saldo es la suma de los movimientos (libro contable, nunca se edita).
 */

/** 3% del total pagado de cada orden. */
export const CASHBACK_PORCENTAJE = 0.03;

export type TipoMovimientoCashback =
  | "abono"          // se ganó con una orden pagada (+)
  | "uso"            // se usó como descuento en una orden (−)
  | "reverso_abono"  // la orden que lo generó se canceló (−)
  | "reembolso_uso"  // la orden donde se usó se canceló (+)
  | "ajuste";        // corrección manual (±)

export interface MovimientoCashback {
  id: string;
  clienteId: string;
  ordenId: string | null;
  ordenNumero: number | null;
  tipo: TipoMovimientoCashback;
  monto: number;
  descripcion: string | null;
  createdAt: string;
}

export interface EstadoCashback {
  saldo: number;
  movimientos: MovimientoCashback[];
}

export const ETIQUETA_MOVIMIENTO: Record<TipoMovimientoCashback, string> = {
  abono: "Cashback ganado",
  uso: "Usado en tu compra",
  reverso_abono: "Orden cancelada (cashback revertido)",
  reembolso_uso: "Orden cancelada (cashback devuelto)",
  ajuste: "Ajuste",
};

/** Monto de cashback que genera una orden: 3% del total pagado, al centavo. */
export function cashbackDeOrden(totalPagado: number): number {
  return Math.round(Math.max(0, totalPagado) * CASHBACK_PORCENTAJE * 100) / 100;
}
