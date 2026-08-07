// src/modules/admin/raws/data/repositories/Ornamento.repository.impl.ts

import type {
  OrnamentoRepository,
  OrnamentoFilters,
  PaginatedResult,
} from "../../domain/repositories/Ornamento.repository";
import type {
  Ornamento,
  CreateOrnamentoDTO,
  UpdateOrnamentoDTO,
} from "../../domain/entities/Ornamento.entity";
import { OrnamentoSupabaseDatasource } from "../datasources/OrnamentoSupabase.datasource";

export class OrnamentoRepositoryImpl implements OrnamentoRepository {
  private ds = new OrnamentoSupabaseDatasource();

  findAll(filters: OrnamentoFilters): Promise<PaginatedResult<Ornamento>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Ornamento | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateOrnamentoDTO): Promise<Ornamento> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateOrnamentoDTO): Promise<Ornamento> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
