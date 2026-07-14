import type {
  GelatinaRepository,
  GelatinaFilters,
} from "../repositories/Gelatina.repository";
import type {
  CreateGelatinaDTO,
  UpdateGelatinaDTO,
} from "../entities/Gelatina.entity";

export class GetGelatinasUseCase {
  constructor(private repo: GelatinaRepository) {}
  execute(filters: GelatinaFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetGelatinaByIdUseCase {
  constructor(private repo: GelatinaRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Gelatina ${id} no encontrada`);
    return item;
  }
}

export class CreateGelatinaUseCase {
  constructor(private repo: GelatinaRepository) {}
  execute(dto: CreateGelatinaDTO) {
    return this.repo.create(dto);
  }
}

export class UpdateGelatinaUseCase {
  constructor(private repo: GelatinaRepository) {}
  async execute(id: string, dto: UpdateGelatinaDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Gelatina ${id} no encontrada`);
    return this.repo.update(id, dto);
  }
}

export class DeleteGelatinaUseCase {
  constructor(private repo: GelatinaRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
