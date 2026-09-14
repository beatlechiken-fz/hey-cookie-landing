// src/modules/admin/store/data/repositories/Inventario.repository.impl.ts

import type {
  InventarioRepository,
  StockFilters,
  ProduccionFilters,
  OrdenItemInventario,
} from "../../domain/repositories/Inventario.repository";
import type { PaginatedResult } from "../../domain/repositories/Producto.repository";
import type {
  Produccion,
  CreateProduccionDTO,
  InventarioMovimiento,
  ProductoStock,
  CreateAjusteInventarioDTO,
} from "../../domain/entities/Inventario.entity";
import { InventarioSupabaseDatasource } from "../datasources/InventarioSupabase.datasource";

export class InventarioRepositoryImpl implements InventarioRepository {
  private ds = new InventarioSupabaseDatasource();

  listStock(filters: StockFilters): Promise<PaginatedResult<ProductoStock>> {
    return this.ds.listStock(filters);
  }
  getStockByProducto(productoId: string): Promise<ProductoStock | null> {
    return this.ds.getStockByProducto(productoId);
  }
  listMovimientos(
    productoId: string,
    filters: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<InventarioMovimiento>> {
    return this.ds.listMovimientos(productoId, filters);
  }
  registrarProduccion(dto: CreateProduccionDTO): Promise<Produccion> {
    return this.ds.registrarProduccion(dto);
  }
  listProducciones(filters: ProduccionFilters): Promise<PaginatedResult<Produccion>> {
    return this.ds.listProducciones(filters);
  }
  ajustarManual(dto: CreateAjusteInventarioDTO): Promise<void> {
    return this.ds.ajustarManual(dto);
  }
  descontarPorOrden(ordenId: string, items: OrdenItemInventario[]): Promise<void> {
    return this.ds.descontarPorOrden(ordenId, items);
  }
  restaurarPorOrden(ordenId: string): Promise<void> {
    return this.ds.restaurarPorOrden(ordenId);
  }
}
