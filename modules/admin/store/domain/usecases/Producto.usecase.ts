// src/modules/admin/productos/domain/usecases/Producto.usecase.ts

import type {
  ProductoRepository,
  ProductoFilters,
} from "../repositories/Producto.repository";
import type {
  CreateProductoDTO,
  UpdateProductoDTO,
} from "../entities/Producto.entity";

export class GetProductosUseCase {
  constructor(private repo: ProductoRepository) {}
  execute(filters: ProductoFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetProductoByIdUseCase {
  constructor(private repo: ProductoRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Producto ${id} no encontrado`);
    return item;
  }
}

export class CreateProductoUseCase {
  constructor(private repo: ProductoRepository) {}
  execute(dto: CreateProductoDTO) {
    if (!dto.nombre.trim()) throw new Error("El nombre es requerido");
    if (dto.permiteMedidaPersonalizada && !dto.medidaBaseCm) {
      throw new Error(
        "Si permite medida personalizada, debe especificar medidaBaseCm",
      );
    }
    return this.repo.create(dto);
  }
}

export class UpdateProductoUseCase {
  constructor(private repo: ProductoRepository) {}
  async execute(id: string, dto: UpdateProductoDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Producto ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteProductoUseCase {
  constructor(private repo: ProductoRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
