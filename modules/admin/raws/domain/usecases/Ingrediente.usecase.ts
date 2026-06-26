// src/modules/admin/store/domain/usecases/Ingrediente.usecase.ts

import type {
  IngredienteRepository,
  ToppingRepository,
  IngredienteFilters,
} from "../repositories/Ingrediente.repository";
import type {
  CreateIngredienteDTO,
  UpdateIngredienteDTO,
  UpsertToppingCantidadDTO,
} from "../entities/Ingrediente.entity";

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeCosts(dto: CreateIngredienteDTO) {
  const { cantidadBase, unidadBase, costoBase } = dto;
  const isWV = unidadBase === "gr" || unidadBase === "ml";
  const costoKgL =
    isWV && cantidadBase && cantidadBase > 0
      ? parseFloat(((costoBase / cantidadBase) * 1000).toFixed(6))
      : null;
  const costoUnidadMinima =
    cantidadBase && cantidadBase > 0
      ? parseFloat((costoBase / cantidadBase).toFixed(6))
      : null;
  return { costoKgL, costoUnidadMinima };
}

// ── Ingrediente Use Cases ─────────────────────────────────────────────────────

export class GetIngredientesUseCase {
  constructor(private repo: IngredienteRepository) {}
  execute(filters: IngredienteFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetIngredienteByIdUseCase {
  constructor(private repo: IngredienteRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Ingrediente ${id} no encontrado`);
    return item;
  }
}

export class CreateIngredienteUseCase {
  constructor(private repo: IngredienteRepository) {}
  execute(dto: CreateIngredienteDTO) {
    const { costoKgL, costoUnidadMinima } = computeCosts(dto);
    return this.repo.create({ ...dto, costoKgL, costoUnidadMinima } as any);
  }
}

export class UpdateIngredienteUseCase {
  constructor(private repo: IngredienteRepository) {}
  async execute(id: string, dto: UpdateIngredienteDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Ingrediente ${id} no encontrado`);
    const merged = { ...existing, ...dto };
    const { costoKgL, costoUnidadMinima } = computeCosts(
      merged as CreateIngredienteDTO,
    );
    return this.repo.update(id, { ...dto, costoKgL, costoUnidadMinima } as any);
  }
}

export class DeleteIngredienteUseCase {
  constructor(private repo: IngredienteRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class SetToppingUseCase {
  constructor(private repo: IngredienteRepository) {}
  execute(id: string, value: boolean) {
    return this.repo.setTopping(id, value);
  }
}

// ── Topping Use Cases ─────────────────────────────────────────────────────────

export class GetToppingsUseCase {
  constructor(private repo: ToppingRepository) {}
  execute() {
    return this.repo.findAll();
  }
}

export class UpsertToppingCantidadUseCase {
  constructor(private repo: ToppingRepository) {}
  execute(dto: UpsertToppingCantidadDTO) {
    return this.repo.upsert(dto);
  }
}

export class RemoveToppingUseCase {
  constructor(private repo: ToppingRepository) {}
  execute(ingredienteId: string) {
    return this.repo.removeTopping(ingredienteId);
  }
}

// ── Licor Use Cases ───────────────────────────────────────────────────────────

import type { LicorRepository } from "../repositories/Ingrediente.repository";
import type { UpsertLicorCantidadDTO } from "../entities/Ingrediente.entity";

export class GetLicoresUseCase {
  constructor(private repo: LicorRepository) {}
  execute() {
    return this.repo.findAll();
  }
}

export class UpsertLicorCantidadUseCase {
  constructor(private repo: LicorRepository) {}
  execute(dto: UpsertLicorCantidadDTO) {
    return this.repo.upsert(dto);
  }
}
