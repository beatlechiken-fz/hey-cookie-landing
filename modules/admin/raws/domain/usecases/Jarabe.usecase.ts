// src/modules/admin/raws/domain/usecases/Jarabe.usecase.ts

import type {
  JarabeRepository,
  JarabeFilters,
} from "../repositories/Jarabe.repository";
import type {
  CreateJarabeDTO,
  UpdateJarabeDTO,
} from "../entities/Jarabe.entity";
import type {
  SaborJarabeRepository,
  SaborJarabeFilters,
} from "../repositories/Jarabe.repository";
import type {
  CreateSaborJarabeDTO,
  UpdateSaborJarabeDTO,
} from "../entities/Jarabe.entity";

export class GetJarabesUseCase {
  constructor(private repo: JarabeRepository) {}
  execute(filters: JarabeFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetJarabeByIdUseCase {
  constructor(private repo: JarabeRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Jarabe ${id} no encontrado`);
    return item;
  }
}

export class CreateJarabeUseCase {
  constructor(private repo: JarabeRepository) {}
  execute(dto: CreateJarabeDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateJarabeUseCase {
  constructor(private repo: JarabeRepository) {}
  async execute(id: string, dto: UpdateJarabeDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Jarabe ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteJarabeUseCase {
  constructor(private repo: JarabeRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

// ── Sabor Jarabe Use Cases ────────────────────────────────────────────────────
export class GetSaboresJarabeUseCase {
  constructor(private repo: SaborJarabeRepository) {}
  execute(filters: SaborJarabeFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetSaborJarabeByIdUseCase {
  constructor(private repo: SaborJarabeRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Sabor de jarabe ${id} no encontrado`);
    return item;
  }
}

export class CreateSaborJarabeUseCase {
  constructor(private repo: SaborJarabeRepository) {}
  execute(dto: CreateSaborJarabeDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateSaborJarabeUseCase {
  constructor(private repo: SaborJarabeRepository) {}
  async execute(id: string, dto: UpdateSaborJarabeDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Sabor de jarabe ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteSaborJarabeUseCase {
  constructor(private repo: SaborJarabeRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
