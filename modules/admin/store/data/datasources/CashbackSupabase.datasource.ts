// src/modules/admin/store/data/datasources/CashbackSupabase.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  EstadoCashback,
  MovimientoCashback,
  TipoMovimientoCashback,
} from "../../domain/entities/Cashback.entity";

const TABLE = "cashback_movimientos";

interface MovimientoRow {
  id: string;
  cliente_id: string;
  orden_id: string | null;
  tipo: TipoMovimientoCashback;
  monto: number | string;
  descripcion: string | null;
  created_at: string;
  ordenes?: { numero: number | null } | null;
}

function toEntity(r: MovimientoRow): MovimientoCashback {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    ordenId: r.orden_id,
    ordenNumero: r.ordenes?.numero ?? null,
    tipo: r.tipo,
    monto: Number(r.monto),
    descripcion: r.descripcion,
    createdAt: r.created_at,
  };
}

const redondear = (n: number) => Math.round(n * 100) / 100;

export class CashbackSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async estadoDeCliente(clienteId: string): Promise<EstadoCashback> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*, ordenes(numero)")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`estadoDeCliente cashback: ${error.message}`);
    const movimientos = ((data ?? []) as MovimientoRow[]).map(toEntity);
    return { saldo: redondear(movimientos.reduce((s, m) => s + m.monto, 0)), movimientos };
  }

  async movimientosDeOrden(ordenId: string): Promise<MovimientoCashback[]> {
    const { data, error } = await this.db.from(TABLE).select("*").eq("orden_id", ordenId);
    if (error) throw new Error(`movimientosDeOrden cashback: ${error.message}`);
    return ((data ?? []) as MovimientoRow[]).map(toEntity);
  }

  async registrarDeOrden(
    clienteId: string,
    ordenId: string,
    tipo: TipoMovimientoCashback,
    monto: number,
    descripcion: string,
  ): Promise<void> {
    if (monto === 0) return;
    const { error } = await this.db
      .from(TABLE)
      .insert({ cliente_id: clienteId, orden_id: ordenId, tipo, monto: redondear(monto), descripcion });
    // 23505 = ya existe ese movimiento para la orden (índice único): idempotente.
    if (error && error.code !== "23505") throw new Error(`registrar cashback: ${error.message}`);
  }

  async aplicarAOrden(clienteId: string, ordenId: string, maximo: number): Promise<number> {
    const { data, error } = await this.db.rpc("cashback_aplicar_a_orden", {
      p_cliente: clienteId,
      p_orden: ordenId,
      p_max: redondear(maximo),
    });
    if (error) throw new Error(`aplicar cashback: ${error.message}`);
    return Number(data ?? 0);
  }
}
