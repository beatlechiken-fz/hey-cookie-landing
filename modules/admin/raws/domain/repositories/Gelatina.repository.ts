import type {
  Gelatina,
  CreateGelatinaDTO,
  UpdateGelatinaDTO,
} from "../entities/Gelatina.entity";

export interface GelatinaFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GelatinaRepository {
  findAll(filters: GelatinaFilters): Promise<PaginatedResult<Gelatina>>;
  findById(id: string): Promise<Gelatina | null>;
  create(dto: CreateGelatinaDTO): Promise<Gelatina>;
  update(id: string, dto: UpdateGelatinaDTO): Promise<Gelatina>;
  delete(id: string): Promise<void>;
}
