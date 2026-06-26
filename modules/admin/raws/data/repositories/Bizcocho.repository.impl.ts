// src/modules/admin/store/data/repositories/Bizcocho.repository.impl.ts

import type {
  BizcochoRepository,
  BizcochoFilters,
  PaginatedResult,
} from "../../domain/repositories/Bizcocho.repository";
import type {
  Bizcocho,
  CreateBizcochoDTO,
  UpdateBizcochoDTO,
} from "../../domain/entities/Bizcocho.entity";
import { BizcochoSupabaseDatasource } from "../datasources/BizcochoSupabase.datasource";

export class BizcochoRepositoryImpl implements BizcochoRepository {
  private ds = new BizcochoSupabaseDatasource();

  findAll(filters: BizcochoFilters): Promise<PaginatedResult<Bizcocho>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Bizcocho | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateBizcochoDTO): Promise<Bizcocho> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateBizcochoDTO): Promise<Bizcocho> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
