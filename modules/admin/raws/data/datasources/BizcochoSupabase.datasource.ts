// src/modules/admin/store/data/datasources/Bizcocho.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Bizcocho,
  BizcochoIngrediente,
  CreateBizcochoDTO,
  UpdateBizcochoDTO,
} from "../../domain/entities/Bizcocho.entity";
import type {
  BizcochoFilters,
  PaginatedResult,
} from "../../domain/repositories/Bizcocho.repository";

const TABLE = "bizcochos";
const TABLE_INGS = "bizcocho_ingredientes";

function toEntity(row: any, ingredientes: BizcochoIngrediente[]): Bizcocho {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    elaboracion: row.elaboracion ?? null,
    costoTotal: Number(row.costo_total ?? 0),
    activo: row.activo,
    ingredientes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toIngEntity(row: any): BizcochoIngrediente {
  return {
    id: row.id,
    bizcochoId: row.bizcocho_id,
    ingredienteId: row.ingrediente_id,
    ingredienteNombre: row.ingredientes?.nombre ?? "",
    ingredienteUnidad: row.ingredientes?.unidad_base ?? "",
    cantidad: Number(row.cantidad),
    costoCalculado:
      row.costo_calculado != null ? Number(row.costo_calculado) : null,
  };
}

export class BizcochoSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: BizcochoFilters): Promise<PaginatedResult<Bizcocho>> {
    const { search, activo = true, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db.from(TABLE).select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, from + pageSize - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(`findAll bizcochos: ${error.message}`);

    const ids = (rows ?? []).map((r: any) => r.id);
    const ingMap: Record<string, BizcochoIngrediente[]> = {};

    if (ids.length > 0) {
      const { data: ingRows, error: ingErr } = await this.db
        .from(TABLE_INGS)
        .select("*, ingredientes(nombre, unidad_base)")
        .in("bizcocho_id", ids);
      if (ingErr) throw new Error(`findAll ingredientes: ${ingErr.message}`);
      for (const r of ingRows ?? []) {
        if (!ingMap[r.bizcocho_id]) ingMap[r.bizcocho_id] = [];
        ingMap[r.bizcocho_id].push(toIngEntity(r));
      }
    }

    return {
      data: (rows ?? []).map((r: any) => toEntity(r, ingMap[r.id] ?? [])),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Bizcocho | null> {
    const { data: row, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById bizcocho: ${error.message}`);

    const { data: ingRows, error: ingErr } = await this.db
      .from(TABLE_INGS)
      .select("*, ingredientes(nombre, unidad_base)")
      .eq("bizcocho_id", id);
    if (ingErr) throw new Error(`findById ingredientes: ${ingErr.message}`);

    return toEntity(row, (ingRows ?? []).map(toIngEntity));
  }

  async create(dto: CreateBizcochoDTO): Promise<Bizcocho> {
    const db = this.db;
    const ingIds = dto.ingredientes.map((i) => i.ingredienteId);
    const { data: ingData } = await db
      .from("ingredientes")
      .select("id, costo_unidad_minima")
      .in("id", ingIds);
    const costMap: Record<string, number> = {};
    for (const r of ingData ?? [])
      costMap[r.id] = Number(r.costo_unidad_minima ?? 0);

    const costoTotal = dto.ingredientes.reduce(
      (s, i) => s + i.cantidad * (costMap[i.ingredienteId] ?? 0),
      0,
    );

    const { data: biz, error } = await db
      .from(TABLE)
      .insert({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        elaboracion: dto.elaboracion ?? null,
        costo_total: costoTotal,
      })
      .select()
      .single();
    if (error) throw new Error(`create bizcocho: ${error.message}`);

    if (dto.ingredientes.length > 0) {
      const rows = dto.ingredientes.map((i) => ({
        bizcocho_id: biz.id,
        ingrediente_id: i.ingredienteId,
        cantidad: i.cantidad,
        costo_calculado: i.cantidad * (costMap[i.ingredienteId] ?? 0),
      }));
      const { error: ingErr } = await db.from(TABLE_INGS).insert(rows);
      if (ingErr)
        throw new Error(`create ingredientes bizcocho: ${ingErr.message}`);
    }

    return this.findById(biz.id) as Promise<Bizcocho>;
  }

  async update(id: string, dto: UpdateBizcochoDTO): Promise<Bizcocho> {
    const db = this.db;
    const updates: Record<string, any> = {};
    if (dto.nombre !== undefined) updates.nombre = dto.nombre;
    if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion;
    if (dto.elaboracion !== undefined) updates.elaboracion = dto.elaboracion;

    if (dto.ingredientes) {
      const ingIds = dto.ingredientes.map((i) => i.ingredienteId);
      const { data: ingData } = await db
        .from("ingredientes")
        .select("id, costo_unidad_minima")
        .in("id", ingIds);
      const costMap: Record<string, number> = {};
      for (const r of ingData ?? [])
        costMap[r.id] = Number(r.costo_unidad_minima ?? 0);

      updates.costo_total = dto.ingredientes.reduce(
        (s, i) => s + i.cantidad * (costMap[i.ingredienteId] ?? 0),
        0,
      );

      await db.from(TABLE_INGS).delete().eq("bizcocho_id", id);
      if (dto.ingredientes.length > 0) {
        const rows = dto.ingredientes.map((i) => ({
          bizcocho_id: id,
          ingrediente_id: i.ingredienteId,
          cantidad: i.cantidad,
          costo_calculado: i.cantidad * (costMap[i.ingredienteId] ?? 0),
        }));
        const { error } = await db.from(TABLE_INGS).insert(rows);
        if (error) throw new Error(`update ingredientes: ${error.message}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await db.from(TABLE).update(updates).eq("id", id);
      if (error) throw new Error(`update bizcocho: ${error.message}`);
    }

    return this.findById(id) as Promise<Bizcocho>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete bizcocho: ${error.message}`);
  }
}
