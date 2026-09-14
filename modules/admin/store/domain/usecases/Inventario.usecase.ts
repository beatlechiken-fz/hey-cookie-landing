// src/modules/admin/store/domain/usecases/Inventario.usecase.ts

import type {
  InventarioRepository,
  StockFilters,
  ProduccionFilters,
  OrdenItemInventario,
} from "../repositories/Inventario.repository";
import type { CreateProduccionDTO, CreateAjusteInventarioDTO } from "../entities/Inventario.entity";

export class ListStockUseCase {
  constructor(private repo: InventarioRepository) {}
  execute(filters: StockFilters) {
    return this.repo.listStock(filters);
  }
}

export class GetStockByProductoUseCase {
  constructor(private repo: InventarioRepository) {}
  async execute(productoId: string) {
    const stock = await this.repo.getStockByProducto(productoId);
    if (!stock) throw new Error(`Producto ${productoId} no encontrado`);
    const movimientos = await this.repo.listMovimientos(productoId, { pageSize: 20 });
    return { ...stock, movimientos: movimientos.data };
  }
}

export class RegistrarProduccionUseCase {
  constructor(private repo: InventarioRepository) {}
  execute(dto: CreateProduccionDTO) {
    if (!dto.productoId) throw new Error("Selecciona un producto");
    if (!dto.cantidad || dto.cantidad <= 0)
      throw new Error("La cantidad producida debe ser mayor a 0");
    return this.repo.registrarProduccion(dto);
  }
}

export class ListProduccionesUseCase {
  constructor(private repo: InventarioRepository) {}
  execute(filters: ProduccionFilters) {
    return this.repo.listProducciones(filters);
  }
}

export class AjustarInventarioUseCase {
  constructor(private repo: InventarioRepository) {}
  execute(dto: CreateAjusteInventarioDTO) {
    if (!dto.cantidad) throw new Error("El ajuste no puede ser 0");
    return this.repo.ajustarManual(dto);
  }
}

/**
 * Descuenta o restaura inventario cuando una orden cambia de status —
 * llamado desde el usecase/route de órdenes, no tiene endpoint propio.
 */
export class DescontarInventarioOrdenUseCase {
  constructor(private repo: InventarioRepository) {}
  execute(ordenId: string, items: OrdenItemInventario[]) {
    return this.repo.descontarPorOrden(ordenId, items);
  }
}

export class RestaurarInventarioOrdenUseCase {
  constructor(private repo: InventarioRepository) {}
  execute(ordenId: string) {
    return this.repo.restaurarPorOrden(ordenId);
  }
}
