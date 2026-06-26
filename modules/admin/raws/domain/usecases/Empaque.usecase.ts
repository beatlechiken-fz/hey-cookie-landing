// src/modules/admin/store/domain/usecases/Empaque.usecase.ts

import type {
  EmpaqueRepository,
  EmpaqueFilters,
} from "../repositories/Empaque.repository";
import type {
  CreateEmpaqueDTO,
  UpdateEmpaqueDTO,
} from "../entities/Empaque.entity";

export class GetEmpaquesUseCase {
  constructor(private repo: EmpaqueRepository) {}
  execute(filters: EmpaqueFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetEmpaqueByIdUseCase {
  constructor(private repo: EmpaqueRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Empaque ${id} no encontrado`);
    return item;
  }
}

export class CreateEmpaqueUseCase {
  constructor(private repo: EmpaqueRepository) {}
  execute(dto: CreateEmpaqueDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateEmpaqueUseCase {
  constructor(private repo: EmpaqueRepository) {}
  async execute(id: string, dto: UpdateEmpaqueDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Empaque ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteEmpaqueUseCase {
  constructor(private repo: EmpaqueRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
