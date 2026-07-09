// src/features/coberturas/infrastructure/datasources/CoberturaSupabaseDatasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Cobertura,
  CoberturaIngrediente,
  CreateCoberturaDTO,
  UpdateCoberturaDTO,
  Sabor,
  CreateSaborDTO,
  UpdateSaborDTO,
} from "../../domain/entities/Cobertura.entity";
import type {
  CoberturaFilters,
  SaborFilters,
  PaginatedResult,
} from "../../domain/repositories/Cobertura.repository";

function toCoberturaEntity(
  row: any,
  ingredientes: CoberturaIngrediente[],
): Cobertura {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    elaboracion: row.elaboracion ?? null, // ← nuevo
    costoTotal: Number(row.costo_total ?? 0),
    activo: row.activo,
    ingredientes,
    imagenUrl: row.imagen_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toIngredienteEntity(row: any): CoberturaIngrediente {
  return {
    id: row.id,
    coberturaId: row.cobertura_id,
    ingredienteId: row.ingrediente_id,
    ingredienteNombre: row.ingredientes?.nombre ?? "",
    ingredienteUnidad: row.ingredientes?.unidad_base ?? "",
    cantidad: Number(row.cantidad),
    costoCalculado:
      row.costo_calculado != null ? Number(row.costo_calculado) : null,
  };
}

function toSaborEntity(row: any): Sabor {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio != null ? Number(row.precio) : null,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CoberturaSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  // ── Coberturas ──────────────────────────────────────────────────────────────

  async findAll(
    filters: CoberturaFilters,
  ): Promise<PaginatedResult<Cobertura>> {
    const { search, activo = true, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.db.from("coberturas").select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, to);

    const { data: cobRows, error, count } = await q;
    if (error) throw new Error(`findAll coberturas: ${error.message}`);

    const ids = (cobRows ?? []).map((r: any) => r.id);
    let ingredientesMap: Record<string, CoberturaIngrediente[]> = {};

    if (ids.length > 0) {
      const { data: ingRows, error: ingErr } = await this.db
        .from("cobertura_ingredientes")
        .select("*, ingredientes(nombre, unidad_base)")
        .in("cobertura_id", ids);
      if (ingErr) throw new Error(`findAll ingredientes: ${ingErr.message}`);
      for (const row of ingRows ?? []) {
        const cid = row.cobertura_id;
        if (!ingredientesMap[cid]) ingredientesMap[cid] = [];
        ingredientesMap[cid].push(toIngredienteEntity(row));
      }
    }

    return {
      data: (cobRows ?? []).map((r: any) =>
        toCoberturaEntity(r, ingredientesMap[r.id] ?? []),
      ),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Cobertura | null> {
    const { data: row, error } = await this.db
      .from("coberturas")
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById cobertura: ${error.message}`);

    const { data: ingRows, error: ingErr } = await this.db
      .from("cobertura_ingredientes")
      .select("*, ingredientes(nombre, unidad_base)")
      .eq("cobertura_id", id);
    if (ingErr) throw new Error(`findById ingredientes: ${ingErr.message}`);

    return toCoberturaEntity(row, (ingRows ?? []).map(toIngredienteEntity));
  }

  async create(dto: CreateCoberturaDTO): Promise<Cobertura> {
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
      (sum, i) => sum + i.cantidad * (costMap[i.ingredienteId] ?? 0),
      0,
    );

    const { data: cob, error: cobErr } = await db
      .from("coberturas")
      .insert({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        elaboracion: dto.elaboracion ?? null, // ← nuevo
        imagen_url: dto.imagenUrl ?? null,
        costo_total: costoTotal,
      })
      .select()
      .single();
    if (cobErr) throw new Error(`create cobertura: ${cobErr.message}`);

    if (dto.ingredientes.length > 0) {
      const rows = dto.ingredientes.map((i) => ({
        cobertura_id: cob.id,
        ingrediente_id: i.ingredienteId,
        cantidad: i.cantidad,
        costo_calculado: i.cantidad * (costMap[i.ingredienteId] ?? 0),
      }));
      const { error: ingErr } = await db
        .from("cobertura_ingredientes")
        .insert(rows);
      if (ingErr) throw new Error(`create ingredientes: ${ingErr.message}`);
    }

    return this.findById(cob.id) as Promise<Cobertura>;
  }

  async update(id: string, dto: UpdateCoberturaDTO): Promise<Cobertura> {
    const db = this.db;
    const updates: Record<string, any> = {};
    if (dto.nombre !== undefined) updates.nombre = dto.nombre;
    if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion;
    if (dto.elaboracion !== undefined) updates.elaboracion = dto.elaboracion; // ← nuevo
    if (dto.imagenUrl !== undefined) updates.imagen_url = dto.imagenUrl;

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
        (sum, i) => sum + i.cantidad * (costMap[i.ingredienteId] ?? 0),
        0,
      );

      await db.from("cobertura_ingredientes").delete().eq("cobertura_id", id);
      if (dto.ingredientes.length > 0) {
        const rows = dto.ingredientes.map((i) => ({
          cobertura_id: id,
          ingrediente_id: i.ingredienteId,
          cantidad: i.cantidad,
          costo_calculado: i.cantidad * (costMap[i.ingredienteId] ?? 0),
        }));
        const { error } = await db.from("cobertura_ingredientes").insert(rows);
        if (error) throw new Error(`update ingredientes: ${error.message}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await db
        .from("coberturas")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(`update cobertura: ${error.message}`);
    }

    return this.findById(id) as Promise<Cobertura>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from("coberturas")
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete cobertura: ${error.message}`);
  }

  // ── Sabores ─────────────────────────────────────────────────────────────────

  async findAllSabores(filters: SaborFilters): Promise<PaginatedResult<Sabor>> {
    const { search, activo = true, page = 1, pageSize = 50 } = filters;
    const from = (page - 1) * pageSize;
    let q = this.db.from("sabores").select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(`findAll sabores: ${error.message}`);
    return {
      data: (data ?? []).map(toSaborEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findSaborById(id: string): Promise<Sabor | null> {
    const { data, error } = await this.db
      .from("sabores")
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById sabor: ${error.message}`);
    return toSaborEntity(data);
  }

  async createSabor(dto: CreateSaborDTO): Promise<Sabor> {
    const { data, error } = await this.db
      .from("sabores")
      .insert({ nombre: dto.nombre, precio: dto.precio ?? null })
      .select()
      .single();
    if (error) throw new Error(`create sabor: ${error.message}`);
    return toSaborEntity(data);
  }

  async updateSabor(id: string, dto: UpdateSaborDTO): Promise<Sabor> {
    const updates: Record<string, any> = {};
    if (dto.nombre !== undefined) updates.nombre = dto.nombre;
    if (dto.precio !== undefined) updates.precio = dto.precio;
    const { data, error } = await this.db
      .from("sabores")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update sabor: ${error.message}`);
    return toSaborEntity(data);
  }

  async deleteSabor(id: string): Promise<void> {
    const { error } = await this.db
      .from("sabores")
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete sabor: ${error.message}`);
  }
}
