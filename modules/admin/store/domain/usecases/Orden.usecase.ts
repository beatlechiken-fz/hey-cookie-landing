// src/modules/admin/store/domain/usecases/Orden.usecase.ts

import type { OrdenRepository } from "../repositories/Orden.repository";
import type { CreateOrdenDTO, OrdenStatus } from "../entities/Orden.entity";
import type { OrdenFilters } from "../../data/datasources/Orden.datasource";

export class GetOrdenesUseCase {
  constructor(private repo: OrdenRepository) {}
  execute(filters: OrdenFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetOrdenByIdUseCase {
  constructor(private repo: OrdenRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Orden ${id} no encontrada`);
    return item;
  }
}

export class CreateOrdenUseCase {
  constructor(private repo: OrdenRepository) {}
  execute(dto: CreateOrdenDTO) {
    if (dto.items.length === 0)
      throw new Error("La orden debe tener al menos un producto");
    return this.repo.create(dto);
  }
}

export class UpdateOrdenStatusUseCase {
  constructor(private repo: OrdenRepository) {}
  async execute(id: string, status: OrdenStatus) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Orden ${id} no encontrada`);
    return this.repo.updateStatus(id, status);
  }
}
