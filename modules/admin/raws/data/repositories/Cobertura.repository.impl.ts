// src/features/coberturas/infrastructure/repositories/CoberturaRepositoryImpl.ts

import type {
  CoberturaRepository,
  SaborRepository,
  CoberturaFilters,
  SaborFilters,
  PaginatedResult,
} from "../../domain/repositories/Cobertura.repository";
import type {
  Cobertura,
  CreateCoberturaDTO,
  UpdateCoberturaDTO,
  Sabor,
  CreateSaborDTO,
  UpdateSaborDTO,
} from "../../domain/entities/Cobertura.entity";
import { CoberturaSupabaseDatasource } from "../datasources/CoberturaSupabase.datasource";

const ds = new CoberturaSupabaseDatasource();

export class CoberturaRepositoryImpl implements CoberturaRepository {
  findAll(f: CoberturaFilters) {
    return ds.findAll(f);
  }
  findById(id: string) {
    return ds.findById(id);
  }
  create(dto: CreateCoberturaDTO) {
    return ds.create(dto);
  }
  update(id: string, dto: UpdateCoberturaDTO) {
    return ds.update(id, dto);
  }
  delete(id: string) {
    return ds.delete(id);
  }
}

export class SaborRepositoryImpl implements SaborRepository {
  findAll(f: SaborFilters) {
    return ds.findAllSabores(f);
  }
  findById(id: string) {
    return ds.findSaborById(id);
  }
  create(dto: CreateSaborDTO) {
    return ds.createSabor(dto);
  }
  update(id: string, dto: UpdateSaborDTO) {
    return ds.updateSabor(id, dto);
  }
  delete(id: string) {
    return ds.deleteSabor(id);
  }
}
