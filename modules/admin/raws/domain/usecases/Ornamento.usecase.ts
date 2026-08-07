// src/modules/admin/raws/domain/usecases/Ornamento.usecase.ts

import type {
  OrnamentoRepository,
  OrnamentoFilters,
} from "../repositories/Ornamento.repository";
import type {
  CreateOrnamentoDTO,
  UpdateOrnamentoDTO,
} from "../entities/Ornamento.entity";

export class GetOrnamentosUseCase {
  constructor(private repo: OrnamentoRepository) {}
  execute(filters: OrnamentoFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetOrnamentoByIdUseCase {
  constructor(private repo: OrnamentoRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Ornamento ${id} no encontrado`);
    return item;
  }
}

export class CreateOrnamentoUseCase {
  constructor(private repo: OrnamentoRepository) {}
  execute(dto: CreateOrnamentoDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateOrnamentoUseCase {
  constructor(private repo: OrnamentoRepository) {}
  async execute(id: string, dto: UpdateOrnamentoDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Ornamento ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteOrnamentoUseCase {
  constructor(private repo: OrnamentoRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
