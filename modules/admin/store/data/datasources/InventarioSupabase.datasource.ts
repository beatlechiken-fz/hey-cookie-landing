// src/modules/admin/store/data/datasources/InventarioSupabase.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Produccion,
  CreateProduccionDTO,
  InventarioMovimiento,
  ProductoStock,
  CreateAjusteInventarioDTO,
  TipoMovimientoInventario,
} from "../../domain/entities/Inventario.entity";
import type {
  InventarioRepository,
  StockFilters,
  ProduccionFilters,
  OrdenItemInventario,
} from "../../domain/repositories/Inventario.repository";
import type { PaginatedResult } from "../../domain/repositories/Producto.repository";

const TABLE_PRODUCCIONES = "producciones";
const TABLE_MOVIMIENTOS = "inventario_movimientos";
const TABLE_PRODUCTOS = "productos";

function toProduccionEntity(row: any): Produccion {
  return {
    id: row.id,
    productoId: row.producto_id,
    productoNombre: row.productos?.nombre ?? "",
    cantidad: Number(row.cantidad),
    fecha: row.fecha,
    notas: row.notas ?? null,
    createdAt: row.created_at,
  };
}

function toMovimientoEntity(row: any): InventarioMovimiento {
  return {
    id: row.id,
    productoId: row.producto_id,
    productoNombre: row.productos?.nombre ?? "",
    tipo: row.tipo as TipoMovimientoInventario,
    cantidad: Number(row.cantidad),
    ordenId: row.orden_id ?? null,
    ordenNumero: row.ordenes?.numero ?? null,
    nota: row.nota ?? null,
    createdAt: row.created_at,
  };
}

export class InventarioSupabaseDatasource implements InventarioRepository {
  private get db() {
    return getSupabaseAdmin();
  }

  async listStock(filters: StockFilters): Promise<PaginatedResult<ProductoStock>> {
    const { search, page = 1, pageSize = 30 } = filters;
    const from = (page - 1) * pageSize;
    const db = this.db;

    let q = db
      .from(TABLE_PRODUCTOS)
      .select("id, nombre, imagen_url, linea, stock_actual", { count: "exact" })
      .eq("activo", true);
    if (search) q = q.ilike("nombre", `%${search}%`);
    q = q.order("nombre").range(from, from + pageSize - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(`listStock: ${error.message}`);

    const ids = (rows ?? []).map((r: any) => r.id);
    const ultimaMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: prods } = await db
        .from(TABLE_PRODUCCIONES)
        .select("producto_id, fecha")
        .in("producto_id", ids)
        .order("fecha", { ascending: false });
      for (const p of prods ?? []) {
        if (!ultimaMap[p.producto_id]) ultimaMap[p.producto_id] = p.fecha;
      }
    }

    return {
      data: (rows ?? []).map((r: any) => ({
        productoId: r.id,
        productoNombre: r.nombre,
        imagenUrl: r.imagen_url ?? null,
        linea: r.linea,
        stockActual: Number(r.stock_actual ?? 0),
        ultimaProduccion: ultimaMap[r.id] ?? null,
      })),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async getStockByProducto(productoId: string): Promise<ProductoStock | null> {
    const { data: row, error } = await this.db
      .from(TABLE_PRODUCTOS)
      .select("id, nombre, imagen_url, linea, stock_actual")
      .eq("id", productoId)
      .maybeSingle();
    if (error) throw new Error(`getStockByProducto: ${error.message}`);
    if (!row) return null;

    const { data: ultima } = await this.db
      .from(TABLE_PRODUCCIONES)
      .select("fecha")
      .eq("producto_id", productoId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      productoId: row.id,
      productoNombre: row.nombre,
      imagenUrl: row.imagen_url ?? null,
      linea: row.linea,
      stockActual: Number(row.stock_actual ?? 0),
      ultimaProduccion: ultima?.fecha ?? null,
    };
  }

  async listMovimientos(
    productoId: string,
    filters: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<InventarioMovimiento>> {
    const { page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    const { data: rows, error, count } = await this.db
      .from(TABLE_MOVIMIENTOS)
      .select("*, productos(nombre), ordenes(numero)", { count: "exact" })
      .eq("producto_id", productoId)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`listMovimientos: ${error.message}`);

    return {
      data: (rows ?? []).map(toMovimientoEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  /** Suma `delta` (puede ser negativo) al stock_actual de un producto. */
  private async sumarStock(productoId: string, delta: number): Promise<void> {
    const { data: prod, error: e1 } = await this.db
      .from(TABLE_PRODUCTOS)
      .select("stock_actual")
      .eq("id", productoId)
      .single();
    if (e1) throw new Error(`sumarStock lectura: ${e1.message}`);
    const nuevo = Number(prod?.stock_actual ?? 0) + delta;
    const { error: e2 } = await this.db
      .from(TABLE_PRODUCTOS)
      .update({ stock_actual: nuevo })
      .eq("id", productoId);
    if (e2) throw new Error(`sumarStock escritura: ${e2.message}`);
  }

  async registrarProduccion(dto: CreateProduccionDTO): Promise<Produccion> {
    const { data: row, error } = await this.db
      .from(TABLE_PRODUCCIONES)
      .insert({
        producto_id: dto.productoId,
        cantidad: dto.cantidad,
        fecha: dto.fecha ?? new Date().toISOString().slice(0, 10),
        notas: dto.notas ?? null,
      })
      .select("*, productos(nombre)")
      .single();
    if (error) throw new Error(`registrarProduccion: ${error.message}`);

    await this.sumarStock(dto.productoId, dto.cantidad);
    await this.db.from(TABLE_MOVIMIENTOS).insert({
      producto_id: dto.productoId,
      tipo: "produccion",
      cantidad: dto.cantidad,
      produccion_id: row.id,
      nota: dto.notas ?? null,
    });

    return toProduccionEntity(row);
  }

  async listProducciones(
    filters: ProduccionFilters,
  ): Promise<PaginatedResult<Produccion>> {
    const { productoId, page = 1, pageSize = 30 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db
      .from(TABLE_PRODUCCIONES)
      .select("*, productos(nombre)", { count: "exact" });
    if (productoId) q = q.eq("producto_id", productoId);
    q = q.order("fecha", { ascending: false }).range(from, from + pageSize - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(`listProducciones: ${error.message}`);

    return {
      data: (rows ?? []).map(toProduccionEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async ajustarManual(dto: CreateAjusteInventarioDTO): Promise<void> {
    await this.sumarStock(dto.productoId, dto.cantidad);
    const { error } = await this.db.from(TABLE_MOVIMIENTOS).insert({
      producto_id: dto.productoId,
      tipo: "ajuste",
      cantidad: dto.cantidad,
      nota: dto.nota ?? null,
    });
    if (error) throw new Error(`ajustarManual: ${error.message}`);
  }

  async descontarPorOrden(
    ordenId: string,
    items: OrdenItemInventario[],
  ): Promise<void> {
    // Idempotencia: si ya hay movimientos "venta" para esta orden, no descontar de nuevo.
    const { data: existentes } = await this.db
      .from(TABLE_MOVIMIENTOS)
      .select("id")
      .eq("orden_id", ordenId)
      .eq("tipo", "venta")
      .limit(1);
    if (existentes && existentes.length > 0) return;

    for (const item of items) {
      if (item.cantidad <= 0) continue;
      await this.sumarStock(item.productoId, -item.cantidad);
      await this.db.from(TABLE_MOVIMIENTOS).insert({
        producto_id: item.productoId,
        tipo: "venta",
        cantidad: -item.cantidad,
        orden_id: ordenId,
        nota: `Venta — ${item.productoNombre}`,
      });
    }
  }

  async restaurarPorOrden(ordenId: string): Promise<void> {
    const { data: movs, error } = await this.db
      .from(TABLE_MOVIMIENTOS)
      .select("producto_id, cantidad, productos(nombre)")
      .eq("orden_id", ordenId)
      .eq("tipo", "venta");
    if (error) throw new Error(`restaurarPorOrden: ${error.message}`);

    for (const m of movs ?? []) {
      const cantidad = Math.abs(Number((m as any).cantidad));
      if (cantidad <= 0) continue;
      await this.sumarStock((m as any).producto_id, cantidad);
      await this.db.from(TABLE_MOVIMIENTOS).insert({
        producto_id: (m as any).producto_id,
        tipo: "cancelacion",
        cantidad,
        orden_id: ordenId,
        nota: `Restaurado por cancelación — ${(m as any).productos?.nombre ?? ""}`,
      });
    }
  }
}
