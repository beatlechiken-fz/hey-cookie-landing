// src/modules/admin/productos/domain/repositories/Producto.repository.ts

import type {
  Producto,
  CreateProductoDTO,
  UpdateProductoDTO,
  LineaProducto,
} from "../entities/Producto.entity";

export interface ProductoFilters {
  search?: string;
  linea?: LineaProducto;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductoRepository {
  findAll(filters: ProductoFilters): Promise<PaginatedResult<Producto>>;
  findById(id: string): Promise<Producto | null>;
  create(dto: CreateProductoDTO): Promise<Producto>;
  update(id: string, dto: UpdateProductoDTO): Promise<Producto>;
  delete(id: string): Promise<void>;
}
