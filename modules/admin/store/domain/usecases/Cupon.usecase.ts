// src/modules/admin/store/domain/usecases/Cupon.usecase.ts

import type { CuponRepository } from "../repositories/Cupon.repository";
import type {
  Cupon,
  CreateCuponDTO,
  UpdateCuponDTO,
} from "../entities/Cupon.entity";
import type { CuponFilters } from "../../data/datasources/Cupon.datasource";
import { validarCupon } from "../entities/Cupon.entity";

export class GetCuponesUseCase {
  constructor(private repo: CuponRepository) {}
  execute(filters: CuponFilters) {
    return this.repo.findAll(filters);
  }
}

export class CreateCuponUseCase {
  constructor(private repo: CuponRepository) {}
  async execute(dto: CreateCuponDTO) {
    const existing = await this.repo.findByCodigo(dto.codigo);
    if (existing)
      throw new Error(
        `Ya existe un cupón con el código "${dto.codigo.toUpperCase()}"`,
      );
    return this.repo.create(dto);
  }
}

export class UpdateCuponUseCase {
  constructor(private repo: CuponRepository) {}
  async execute(id: string, dto: UpdateCuponDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error(`Cupón ${id} no encontrado`);
    if (dto.codigo && dto.codigo.toUpperCase() !== existing.codigo) {
      const dup = await this.repo.findByCodigo(dto.codigo);
      if (dup)
        throw new Error(
          `Ya existe un cupón con el código "${dto.codigo.toUpperCase()}"`,
        );
    }
    return this.repo.update(id, dto);
  }
}

export class DeleteCuponUseCase {
  constructor(private repo: CuponRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

/** Valida un cupón por código y devuelve el cupón + el descuento que aplicaría */
export class ValidarCuponUseCase {
  constructor(private repo: CuponRepository) {}
  async execute(codigo: string, subtotal: number, clienteId?: string | null) {
    const cupon = await this.repo.findByCodigo(codigo);
    if (!cupon) throw new Error("Cupón no encontrado");

    let asignadoAlCliente = false;
    if (cupon.tipo === "individual" && clienteId) {
      asignadoAlCliente = await this.repo.estaAsignado(cupon.id, clienteId);
    }

    const { valido, razon } = validarCupon(cupon, clienteId, asignadoAlCliente);
    if (!valido) throw new Error(razon ?? "Cupón inválido");

    return cupon;
  }
}

// ── Asignación m2m cupón <-> cliente ──────────────────────────────────────────

export class GetCuponesAsignadosUseCase {
  constructor(private repo: CuponRepository) {}
  execute(clienteId: string) {
    return this.repo.findAsignadosByCliente(clienteId);
  }
}

export class GetCuponesDisponiblesParaClienteUseCase {
  constructor(private repo: CuponRepository) {}
  execute(clienteId: string, search?: string) {
    return this.repo.findDisponiblesParaCliente(clienteId, search);
  }
}

export class AsignarCuponClienteUseCase {
  constructor(private repo: CuponRepository) {}
  async execute(cuponId: string, clienteId: string) {
    const cupon = await this.repo.findById(cuponId);
    if (!cupon) throw new Error(`Cupón ${cuponId} no encontrado`);
    if (cupon.tipo !== "individual") {
      throw new Error(
        "Solo los cupones de tipo individual pueden asignarse a un cliente",
      );
    }
    await this.repo.asignarACliente(cuponId, clienteId);
  }
}

export class DesasignarCuponClienteUseCase {
  constructor(private repo: CuponRepository) {}
  async execute(cuponId: string, clienteId: string) {
    await this.repo.desasignarDeCliente(cuponId, clienteId);
  }
}
