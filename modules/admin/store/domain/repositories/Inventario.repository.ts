// src/modules/admin/store/domain/repositories/Inventario.repository.ts

import type {
  Produccion,
  CreateProduccionDTO,
  InventarioMovimiento,
  ProductoStock,
  CreateAjusteInventarioDTO,
} from "../entities/Inventario.entity";
import type { PaginatedResult } from "./Producto.repository";

export interface StockFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProduccionFilters {
  productoId?: string;
  page?: number;
  pageSize?: number;
}

/** Ítem de una orden resuelto contra el catálogo — solo los que sí son productos de catálogo. */
export interface OrdenItemInventario {
  productoId: string;
  productoNombre: string;
  cantidad: number;
}

export interface InventarioRepository {
  listStock(filters: StockFilters): Promise<PaginatedResult<ProductoStock>>;
  getStockByProducto(productoId: string): Promise<ProductoStock | null>;
  listMovimientos(
    productoId: string,
    filters: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<InventarioMovimiento>>;

  registrarProduccion(dto: CreateProduccionDTO): Promise<Produccion>;
  listProducciones(filters: ProduccionFilters): Promise<PaginatedResult<Produccion>>;

  ajustarManual(dto: CreateAjusteInventarioDTO): Promise<void>;

  /** Descuenta cada ítem del inventario y registra el movimiento tipo "venta". Idempotente por ordenId. */
  descontarPorOrden(ordenId: string, items: OrdenItemInventario[]): Promise<void>;
  /** Revierte los movimientos "venta" de esta orden — reincorpora la cantidad al stock. */
  restaurarPorOrden(ordenId: string): Promise<void>;
}
