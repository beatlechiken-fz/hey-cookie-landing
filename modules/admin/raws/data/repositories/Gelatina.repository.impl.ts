import type {
  GelatinaRepository,
  GelatinaFilters,
  PaginatedResult,
} from "../../domain/repositories/Gelatina.repository";
import type {
  Gelatina,
  CreateGelatinaDTO,
  UpdateGelatinaDTO,
} from "../../domain/entities/Gelatina.entity";
import { GelatinaSupabaseDatasource } from "../datasources/GelatinaSupabase.datasource";

export class GelatinaRepositoryImpl implements GelatinaRepository {
  private ds = new GelatinaSupabaseDatasource();

  findAll(filters: GelatinaFilters): Promise<PaginatedResult<Gelatina>> {
    return this.ds.findAll(filters);
  }
  findById(id: string): Promise<Gelatina | null> {
    return this.ds.findById(id);
  }
  create(dto: CreateGelatinaDTO): Promise<Gelatina> {
    return this.ds.create(dto);
  }
  update(id: string, dto: UpdateGelatinaDTO): Promise<Gelatina> {
    return this.ds.update(id, dto);
  }
  delete(id: string): Promise<void> {
    return this.ds.delete(id);
  }
}
