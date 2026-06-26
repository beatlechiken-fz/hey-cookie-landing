// src/modules/admin/raws/data/repositories/Jarabe.repository.impl.ts

import type {
  JarabeRepository,
  JarabeFilters,
  PaginatedResult,
} from "../../domain/repositories/Jarabe.repository";
import type {
  Jarabe,
  CreateJarabeDTO,
  UpdateJarabeDTO,
} from "../../domain/entities/Jarabe.entity";
import { JarabeSupabaseDatasource } from "../datasources/JarabeSupabase.datasource";
import type {
  SaborJarabeRepository,
  SaborJarabeFilters,
} from "../../domain/repositories/Jarabe.repository";
import type {
  SaborJarabe,
  CreateSaborJarabeDTO,
  UpdateSaborJarabeDTO,
} from "../../domain/entities/Jarabe.entity";
import { SaborJarabeSupabaseDatasource } from "../datasources/JarabeSupabase.datasource";

export class JarabeRepositoryImpl implements JarabeRepository {
  private ds = new JarabeSupabaseDatasource();

  findAll(filters: JarabeFilters): Promise<PaginatedResult<Jarabe>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Jarabe | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateJarabeDTO): Promise<Jarabe> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateJarabeDTO): Promise<Jarabe> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}

// ── Sabor Jarabe Repository Impl ──────────────────────────────────────────────

export class SaborJarabeRepositoryImpl implements SaborJarabeRepository {
  private ds = new SaborJarabeSupabaseDatasource();
  findAll(f: SaborJarabeFilters): Promise<PaginatedResult<SaborJarabe>> {
    return this.ds.findAll(f);
  }
  findById(id: string): Promise<SaborJarabe | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateSaborJarabeDTO): Promise<SaborJarabe> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateSaborJarabeDTO): Promise<SaborJarabe> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
