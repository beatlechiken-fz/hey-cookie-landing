// src/modules/admin/store/domain/usecases/Orden.usecase.ts

import type { OrdenRepository } from "../repositories/Orden.repository";
import {
  ORDEN_STATUS_EDITABLES,
  type CreateOrdenDTO,
  type OrdenStatus,
  type UpdateOrdenItemDTO,
} from "../entities/Orden.entity";
import type { OrdenFilters } from "../../data/datasources/Orden.datasource";

function assertEditable(status: OrdenStatus) {
  if (!ORDEN_STATUS_EDITABLES.includes(status)) {
    throw new Error(
      "Esta orden ya no se puede editar — solo se permite mientras está en cotización o en proceso.",
    );
  }
}

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

export class UpdateOrdenItemUseCase {
  constructor(private repo: OrdenRepository) {}
  async execute(ordenId: string, itemId: string, dto: UpdateOrdenItemDTO) {
    const existing = await this.repo.findById(ordenId);
    if (!existing) throw new Error(`Orden ${ordenId} no encontrada`);
    assertEditable(existing.status);
    if (!existing.items.some((i) => i.id === itemId))
      throw new Error(`La orden no tiene un producto ${itemId}`);
    if (!dto.nombre.trim()) throw new Error("El nombre del producto es requerido");
    if (dto.cantidad < 1) throw new Error("La cantidad debe ser al menos 1");
    return this.repo.updateItem(ordenId, itemId, dto);
  }
}

export class RemoveOrdenItemUseCase {
  constructor(private repo: OrdenRepository) {}
  async execute(ordenId: string, itemId: string) {
    const existing = await this.repo.findById(ordenId);
    if (!existing) throw new Error(`Orden ${ordenId} no encontrada`);
    assertEditable(existing.status);
    if (existing.items.length <= 1)
      throw new Error(
        "No se puede quitar el último producto de la orden — cancela la orden en su lugar.",
      );
    if (!existing.items.some((i) => i.id === itemId))
      throw new Error(`La orden no tiene un producto ${itemId}`);
    return this.repo.removeItem(ordenId, itemId);
  }
}
