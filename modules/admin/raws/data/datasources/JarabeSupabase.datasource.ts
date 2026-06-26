// src/modules/admin/raws/data/datasources/Jarabe.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Jarabe,
  JarabeIngrediente,
  CreateJarabeDTO,
  UpdateJarabeDTO,
} from "../../domain/entities/Jarabe.entity";
import type {
  JarabeFilters,
  PaginatedResult,
} from "../../domain/repositories/Jarabe.repository";
import type {
  SaborJarabe,
  CreateSaborJarabeDTO,
  UpdateSaborJarabeDTO,
} from "../../domain/entities/Jarabe.entity";
import type { SaborJarabeFilters } from "../../domain/repositories/Jarabe.repository";

const TABLE = "jarabes";
const TABLE_INGS = "jarabe_ingredientes";

function toEntity(row: any, ingredientes: JarabeIngrediente[]): Jarabe {
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

function toIngEntity(row: any): JarabeIngrediente {
  return {
    id: row.id,
    jarabeId: row.jarabe_id,
    ingredienteId: row.ingrediente_id,
    ingredienteNombre: row.ingredientes?.nombre ?? "",
    ingredienteUnidad: row.ingredientes?.unidad_base ?? "",
    cantidad: Number(row.cantidad),
    costoCalculado:
      row.costo_calculado != null ? Number(row.costo_calculado) : null,
  };
}

export class JarabeSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: JarabeFilters): Promise<PaginatedResult<Jarabe>> {
    const { search, activo = true, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db.from(TABLE).select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, from + pageSize - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(`findAll jarabes: ${error.message}`);

    const ids = (rows ?? []).map((r: any) => r.id);
    const ingMap: Record<string, JarabeIngrediente[]> = {};

    if (ids.length > 0) {
      const { data: ingRows, error: ingErr } = await this.db
        .from(TABLE_INGS)
        .select("*, ingredientes(nombre, unidad_base)")
        .in("jarabe_id", ids);
      if (ingErr)
        throw new Error(`findAll jarabe_ingredientes: ${ingErr.message}`);
      for (const r of ingRows ?? []) {
        if (!ingMap[r.jarabe_id]) ingMap[r.jarabe_id] = [];
        ingMap[r.jarabe_id].push(toIngEntity(r));
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

  async findById(id: string): Promise<Jarabe | null> {
    const { data: row, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById jarabe: ${error.message}`);

    const { data: ingRows, error: ingErr } = await this.db
      .from(TABLE_INGS)
      .select("*, ingredientes(nombre, unidad_base)")
      .eq("jarabe_id", id);
    if (ingErr)
      throw new Error(`findById jarabe_ingredientes: ${ingErr.message}`);

    return toEntity(row, (ingRows ?? []).map(toIngEntity));
  }

  async create(dto: CreateJarabeDTO): Promise<Jarabe> {
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

    const { data: jar, error } = await db
      .from(TABLE)
      .insert({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        elaboracion: dto.elaboracion ?? null,
        costo_total: costoTotal,
      })
      .select()
      .single();
    if (error) throw new Error(`create jarabe: ${error.message}`);

    if (dto.ingredientes.length > 0) {
      const rows = dto.ingredientes.map((i) => ({
        jarabe_id: jar.id,
        ingrediente_id: i.ingredienteId,
        cantidad: i.cantidad,
        costo_calculado: i.cantidad * (costMap[i.ingredienteId] ?? 0),
      }));
      const { error: ingErr } = await db.from(TABLE_INGS).insert(rows);
      if (ingErr)
        throw new Error(`create jarabe_ingredientes: ${ingErr.message}`);
    }

    return this.findById(jar.id) as Promise<Jarabe>;
  }

  async update(id: string, dto: UpdateJarabeDTO): Promise<Jarabe> {
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

      await db.from(TABLE_INGS).delete().eq("jarabe_id", id);
      if (dto.ingredientes.length > 0) {
        const rows = dto.ingredientes.map((i) => ({
          jarabe_id: id,
          ingrediente_id: i.ingredienteId,
          cantidad: i.cantidad,
          costo_calculado: i.cantidad * (costMap[i.ingredienteId] ?? 0),
        }));
        const { error } = await db.from(TABLE_INGS).insert(rows);
        if (error)
          throw new Error(`update jarabe_ingredientes: ${error.message}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await db.from(TABLE).update(updates).eq("id", id);
      if (error) throw new Error(`update jarabe: ${error.message}`);
    }

    return this.findById(id) as Promise<Jarabe>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete jarabe: ${error.message}`);
  }
}

// ── Sabor Jarabe Datasource ───────────────────────────────────────────────────
const TABLE_SABORES = "sabores_jarabe";

function toSaborEntity(row: any): SaborJarabe {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio != null ? Number(row.precio) : null,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SaborJarabeSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(
    filters: SaborJarabeFilters,
  ): Promise<PaginatedResult<SaborJarabe>> {
    const { search, activo = true, page = 1, pageSize = 50 } = filters;
    const from = (page - 1) * pageSize;
    let q = this.db.from(TABLE_SABORES).select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, from + pageSize - 1);
    const { data, error, count } = await q;
    if (error) throw new Error(`findAll sabores_jarabe: ${error.message}`);
    return {
      data: (data ?? []).map(toSaborEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<SaborJarabe | null> {
    const { data, error } = await this.db
      .from(TABLE_SABORES)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById sabor_jarabe: ${error.message}`);
    return toSaborEntity(data);
  }

  async create(dto: CreateSaborJarabeDTO): Promise<SaborJarabe> {
    const { data, error } = await this.db
      .from(TABLE_SABORES)
      .insert({ nombre: dto.nombre, precio: dto.precio ?? null })
      .select()
      .single();
    if (error) throw new Error(`create sabor_jarabe: ${error.message}`);
    return toSaborEntity(data);
  }

  async update(id: string, dto: UpdateSaborJarabeDTO): Promise<SaborJarabe> {
    const updates: Record<string, any> = {};
    if (dto.nombre !== undefined) updates.nombre = dto.nombre;
    if (dto.precio !== undefined) updates.precio = dto.precio;
    const { data, error } = await this.db
      .from(TABLE_SABORES)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update sabor_jarabe: ${error.message}`);
    return toSaborEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE_SABORES)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete sabor_jarabe: ${error.message}`);
  }
}
