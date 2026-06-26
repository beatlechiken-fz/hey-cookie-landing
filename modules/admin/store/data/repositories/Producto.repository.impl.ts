// src/modules/admin/productos/data/repositories/Producto.repository.impl.ts

import type {
  ProductoRepository,
  ProductoFilters,
  PaginatedResult,
} from "../../domain/repositories/Producto.repository";
import type {
  Producto,
  CreateProductoDTO,
  UpdateProductoDTO,
} from "../../domain/entities/Producto.entity";
import { ProductoSupabaseDatasource } from "../datasources/Producto.datasource";

export class ProductoRepositoryImpl implements ProductoRepository {
  private ds = new ProductoSupabaseDatasource();

  findAll(filters: ProductoFilters): Promise<PaginatedResult<Producto>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Producto | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateProductoDTO): Promise<Producto> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateProductoDTO): Promise<Producto> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
