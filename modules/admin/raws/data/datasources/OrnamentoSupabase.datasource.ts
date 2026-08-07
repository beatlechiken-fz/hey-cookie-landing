// src/modules/admin/raws/data/datasources/OrnamentoSupabase.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Ornamento,
  CreateOrnamentoDTO,
  UpdateOrnamentoDTO,
} from "../../domain/entities/Ornamento.entity";
import type {
  OrnamentoFilters,
  PaginatedResult,
} from "../../domain/repositories/Ornamento.repository";

const TABLE = "ornamentos";

function toEntity(row: any): Ornamento {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: Number(row.precio),
    imagenUrl: row.imagen_url ?? null,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(dto: Partial<CreateOrnamentoDTO>) {
  const row: Record<string, any> = {};
  if (dto.nombre !== undefined) row.nombre = dto.nombre;
  if (dto.precio !== undefined) row.precio = dto.precio;
  if (dto.imagenUrl !== undefined) row.imagen_url = dto.imagenUrl;
  return row;
}

export class OrnamentoSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: OrnamentoFilters): Promise<PaginatedResult<Ornamento>> {
    const { search, activo = true, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db.from(TABLE).select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(`findAll ornamentos: ${error.message}`);
    return {
      data: (data ?? []).map(toEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Ornamento | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById ornamento: ${error.message}`);
    return toEntity(data);
  }

  async create(dto: CreateOrnamentoDTO): Promise<Ornamento> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(toRow(dto))
      .select()
      .single();
    if (error) throw new Error(`create ornamento: ${error.message}`);
    return toEntity(data);
  }

  async update(id: string, dto: UpdateOrnamentoDTO): Promise<Ornamento> {
    const { data, error } = await this.db
      .from(TABLE)
      .update(toRow(dto))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update ornamento: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete ornamento: ${error.message}`);
  }
}
