// src/modules/admin/store/domain/usecases/Bizcocho.usecase.ts

import type {
  BizcochoRepository,
  BizcochoFilters,
} from "../repositories/Bizcocho.repository";
import type {
  CreateBizcochoDTO,
  UpdateBizcochoDTO,
} from "../entities/Bizcocho.entity";

export class GetBizchosUseCase {
  constructor(private repo: BizcochoRepository) {}
  execute(filters: BizcochoFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetBizchoByIdUseCase {
  constructor(private repo: BizcochoRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Bizcocho ${id} no encontrado`);
    return item;
  }
}

export class CreateBizchoUseCase {
  constructor(private repo: BizcochoRepository) {}
  execute(dto: CreateBizcochoDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateBizchoUseCase {
  constructor(private repo: BizcochoRepository) {}
  async execute(id: string, dto: UpdateBizcochoDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Bizcocho ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteBizchoUseCase {
  constructor(private repo: BizcochoRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
