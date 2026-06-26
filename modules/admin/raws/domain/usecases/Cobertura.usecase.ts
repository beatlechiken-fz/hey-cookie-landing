// src/features/coberturas/application/usecases/CoberturaUseCases.ts

import type {
  CoberturaRepository,
  SaborRepository,
  CoberturaFilters,
  SaborFilters,
} from "../repositories/Cobertura.repository";
import type {
  CreateCoberturaDTO,
  UpdateCoberturaDTO,
  CreateSaborDTO,
  UpdateSaborDTO,
} from "../entities/Cobertura.entity";

// ── Coberturas ────────────────────────────────────────────────────────────────

export class GetCoberturasUseCase {
  constructor(private repo: CoberturaRepository) {}
  execute(filters: CoberturaFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetCoberturaByIdUseCase {
  constructor(private repo: CoberturaRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Cobertura ${id} no encontrada`);
    return item;
  }
}

export class CreateCoberturaUseCase {
  constructor(private repo: CoberturaRepository) {}
  execute(dto: CreateCoberturaDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateCoberturaUseCase {
  constructor(private repo: CoberturaRepository) {}
  async execute(id: string, dto: UpdateCoberturaDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Cobertura ${id} no encontrada`);
    return this.repo.update(id, dto);
  }
}

export class DeleteCoberturaUseCase {
  constructor(private repo: CoberturaRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

// ── Sabores ───────────────────────────────────────────────────────────────────

export class GetSaboresUseCase {
  constructor(private repo: SaborRepository) {}
  execute(filters: SaborFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetSaborByIdUseCase {
  constructor(private repo: SaborRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Sabor ${id} no encontrado`);
    return item;
  }
}

export class CreateSaborUseCase {
  constructor(private repo: SaborRepository) {}
  execute(dto: CreateSaborDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateSaborUseCase {
  constructor(private repo: SaborRepository) {}
  async execute(id: string, dto: UpdateSaborDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Sabor ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteSaborUseCase {
  constructor(private repo: SaborRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
