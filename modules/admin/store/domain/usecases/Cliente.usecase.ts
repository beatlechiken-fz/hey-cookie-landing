// src/modules/admin/clientes/domain/usecases/Cliente.usecase.ts

import type {
  ClienteRepository,
  ClienteFilters,
} from "../repositories/Cliente.repository";
import type {
  CreateClienteDTO,
  UpdateClienteDTO,
} from "../entities/Cliente.entity";

export class GetClientesUseCase {
  constructor(private repo: ClienteRepository) {}
  execute(filters: ClienteFilters) {
    return this.repo.findAll(filters);
  }
}

export class GetClienteByIdUseCase {
  constructor(private repo: ClienteRepository) {}
  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new Error(`Cliente ${id} no encontrado`);
    return item;
  }
}

export class CreateClienteUseCase {
  constructor(private repo: ClienteRepository) {}
  execute(dto: CreateClienteDTO) {
    if (!dto.nombre.trim()) throw new Error("El nombre es requerido");
    return this.repo.create(dto);
  }
}

export class UpdateClienteUseCase {
  constructor(private repo: ClienteRepository) {}
  async execute(id: string, dto: UpdateClienteDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Cliente ${id} no encontrado`);
    return this.repo.update(id, dto);
  }
}

export class DeleteClienteUseCase {
  constructor(private repo: ClienteRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}
