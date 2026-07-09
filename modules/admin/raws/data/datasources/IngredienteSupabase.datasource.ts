// src/modules/admin/store/data/datasources/Ingrediente.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Ingrediente,
  CreateIngredienteDTO,
  UpdateIngredienteDTO,
  ToppingCantidad,
  UpsertToppingCantidadDTO,
} from "../../domain/entities/Ingrediente.entity";
import type {
  IngredienteFilters,
  PaginatedResult,
} from "../../domain/repositories/Ingrediente.repository";

const TABLE = "ingredientes";
const TABLE_TOPPINGS = "topping_cantidades";

function toEntity(row: any): Ingrediente {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    cantidadBase: row.cantidad_base ? Number(row.cantidad_base) : null,
    unidadBase: row.unidad_base,
    costoBase: Number(row.costo_base),
    costoKgL: row.costo_kg_l ? Number(row.costo_kg_l) : null,
    costoUnidadMinima: row.costo_unidad_minima
      ? Number(row.costo_unidad_minima)
      : null,
    topping: row.topping ?? false,
    imagenUrl: row.imagen_url ?? null,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toToppingEntity(row: any): ToppingCantidad {
  return {
    id: row.id,
    ingredienteId: row.ingrediente_id,
    ingredienteNombre: row.ingredientes?.nombre ?? "",
    ingredienteUnidad: row.ingredientes?.unidad_base ?? "",
    costoUnidadMinima: row.ingredientes?.costo_unidad_minima
      ? Number(row.ingredientes.costo_unidad_minima)
      : null,
    cantidad: row.cantidad != null ? Number(row.cantidad) : null,
    unidad: row.unidad ?? null,
    notas: row.notas ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(
  dto: Partial<CreateIngredienteDTO> & {
    costoKgL?: number | null;
    costoUnidadMinima?: number | null;
  },
) {
  const row: Record<string, any> = {};
  if (dto.nombre !== undefined) row.nombre = dto.nombre;
  if (dto.categoria !== undefined) row.categoria = dto.categoria;
  if (dto.cantidadBase !== undefined) row.cantidad_base = dto.cantidadBase;
  if (dto.unidadBase !== undefined) row.unidad_base = dto.unidadBase;
  if (dto.costoBase !== undefined) row.costo_base = dto.costoBase;
  if (dto.costoKgL !== undefined) row.costo_kg_l = dto.costoKgL;
  if (dto.costoUnidadMinima !== undefined)
    row.costo_unidad_minima = dto.costoUnidadMinima;
  if ((dto as any).topping !== undefined) row.topping = (dto as any).topping;
  if ((dto as any).imagenUrl !== undefined) row.imagen_url = (dto as any).imagenUrl;
  return row;
}

export class IngredienteSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(
    filters: IngredienteFilters,
  ): Promise<PaginatedResult<Ingrediente>> {
    const {
      search,
      unidadBase,
      categoria,
      activo = true,
      page = 1,
      pageSize = 20,
    } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db.from(TABLE).select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (unidadBase) q = q.eq("unidad_base", unidadBase);
    if (categoria) q = q.eq("categoria", categoria);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q
      .order("categoria")
      .order("nombre")
      .range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(`findAll ingredientes: ${error.message}`);
    return {
      data: (data ?? []).map(toEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Ingrediente | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById ingrediente: ${error.message}`);
    return toEntity(data);
  }

  async create(
    dto: CreateIngredienteDTO & {
      costoKgL?: number | null;
      costoUnidadMinima?: number | null;
    },
  ): Promise<Ingrediente> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(toRow(dto))
      .select()
      .single();
    if (error) throw new Error(`create ingrediente: ${error.message}`);
    return toEntity(data);
  }

  async update(
    id: string,
    dto: UpdateIngredienteDTO & {
      costoKgL?: number | null;
      costoUnidadMinima?: number | null;
    },
  ): Promise<Ingrediente> {
    const { data, error } = await this.db
      .from(TABLE)
      .update(toRow(dto))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update ingrediente: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete ingrediente: ${error.message}`);
  }

  async setTopping(id: string, value: boolean): Promise<Ingrediente> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ topping: value })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`setTopping: ${error.message}`);
    // Si se quita como topping, eliminar la cantidad si existía
    if (!value) {
      await this.db.from(TABLE_TOPPINGS).delete().eq("ingrediente_id", id);
    }
    return toEntity(data);
  }

  // ── Topping cantidades ──────────────────────────────────────────────────────

  async findAllToppings(): Promise<ToppingCantidad[]> {
    const { data, error } = await this.db
      .from(TABLE_TOPPINGS)
      .select("*, ingredientes(nombre, unidad_base, costo_unidad_minima)")
      .order("ingredientes(nombre)");
    if (error) throw new Error(`findAllToppings: ${error.message}`);
    return (data ?? []).map(toToppingEntity);
  }

  async findToppingsByIngredienteIds(
    ids: string[],
  ): Promise<ToppingCantidad[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.db
      .from(TABLE_TOPPINGS)
      .select("*, ingredientes(nombre, unidad_base, costo_unidad_minima)")
      .in("ingrediente_id", ids);
    if (error) throw new Error(`findToppingsByIds: ${error.message}`);
    return (data ?? []).map(toToppingEntity);
  }

  async upsertTopping(dto: UpsertToppingCantidadDTO): Promise<ToppingCantidad> {
    const { error } = await this.db.from(TABLE_TOPPINGS).upsert(
      {
        ingrediente_id: dto.ingredienteId,
        cantidad: dto.cantidad ?? null,
        unidad: dto.unidad ?? null,
        notas: dto.notas ?? null,
      },
      { onConflict: "ingrediente_id" },
    );
    if (error) throw new Error(`upsertTopping: ${error.message}`);

    const { data, error: fetchErr } = await this.db
      .from(TABLE_TOPPINGS)
      .select("*, ingredientes(nombre, unidad_base, costo_unidad_minima)")
      .eq("ingrediente_id", dto.ingredienteId)
      .single();
    if (fetchErr) throw new Error(`upsertTopping fetch: ${fetchErr.message}`);
    return toToppingEntity(data);
  }

  async removeTopping(ingredienteId: string): Promise<void> {
    // Quita el flag y elimina la cantidad en una transacción lógica
    const { error: e1 } = await this.db
      .from(TABLE)
      .update({ topping: false })
      .eq("id", ingredienteId);
    if (e1) throw new Error(`removeTopping flag: ${e1.message}`);

    const { error: e2 } = await this.db
      .from(TABLE_TOPPINGS)
      .delete()
      .eq("ingrediente_id", ingredienteId);
    if (e2) throw new Error(`removeTopping cantidad: ${e2.message}`);
  }
}

// ── Licor Cantidades Datasource ───────────────────────────────────────────────

import type {
  LicorCantidad,
  UpsertLicorCantidadDTO,
} from "../../domain/entities/Ingrediente.entity";

const TABLE_LICORES = "licor_cantidades";

function toLicorEntity(row: any): LicorCantidad {
  return {
    id: row.id,
    ingredienteId: row.ingrediente_id,
    ingredienteNombre: row.ingredientes?.nombre ?? "",
    ingredienteUnidad: row.ingredientes?.unidad_base ?? "",
    costoUnidadMinima: row.ingredientes?.costo_unidad_minima
      ? Number(row.ingredientes.costo_unidad_minima)
      : null,
    cantidad: row.cantidad != null ? Number(row.cantidad) : null,
    notas: row.notas ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class LicorCantidadSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  // Devuelve todos los ingredientes de categoría licores_bebidas + su cantidad si existe
  async findAll(): Promise<LicorCantidad[]> {
    // Fetch all licores_bebidas ingredients
    const { data: ings, error: ingErr } = await this.db
      .from("ingredientes")
      .select("id, nombre, unidad_base, costo_unidad_minima")
      .eq("categoria", "licores_bebidas")
      .eq("activo", true)
      .order("nombre");
    if (ingErr) throw new Error(`findAll licores ings: ${ingErr.message}`);

    if (!ings || ings.length === 0) return [];

    const ids = ings.map((i: any) => i.id);
    const { data: cants, error: cantErr } = await this.db
      .from(TABLE_LICORES)
      .select("*")
      .in("ingrediente_id", ids);
    if (cantErr)
      throw new Error(`findAll licor_cantidades: ${cantErr.message}`);

    const cantMap: Record<string, any> = {};
    for (const c of cants ?? []) cantMap[c.ingrediente_id] = c;

    return ings.map((ing: any) => {
      const c = cantMap[ing.id];
      return {
        id: c?.id ?? "",
        ingredienteId: ing.id,
        ingredienteNombre: ing.nombre,
        ingredienteUnidad: ing.unidad_base,
        costoUnidadMinima: ing.costo_unidad_minima
          ? Number(ing.costo_unidad_minima)
          : null,
        cantidad: c?.cantidad != null ? Number(c.cantidad) : null,
        notas: c?.notas ?? null,
        createdAt: c?.created_at ?? "",
        updatedAt: c?.updated_at ?? "",
      };
    });
  }

  async upsert(dto: UpsertLicorCantidadDTO): Promise<LicorCantidad> {
    const db = this.db;

    // Verificar si ya existe
    const { data: existing } = await db
      .from(TABLE_LICORES)
      .select("id")
      .eq("ingrediente_id", dto.ingredienteId)
      .maybeSingle();

    if (existing) {
      // UPDATE
      const { error } = await db
        .from(TABLE_LICORES)
        .update({ cantidad: dto.cantidad ?? null, notas: dto.notas ?? null })
        .eq("ingrediente_id", dto.ingredienteId);
      if (error) throw new Error(`upsertLicor update: ${error.message}`);
    } else {
      // INSERT
      const { error } = await db.from(TABLE_LICORES).insert({
        ingrediente_id: dto.ingredienteId,
        cantidad: dto.cantidad ?? null,
        notas: dto.notas ?? null,
      });
      if (error) throw new Error(`upsertLicor insert: ${error.message}`);
    }

    // Fetch con join
    const { data, error: fetchErr } = await db
      .from(TABLE_LICORES)
      .select("*, ingredientes(nombre, unidad_base, costo_unidad_minima)")
      .eq("ingrediente_id", dto.ingredienteId)
      .single();
    if (fetchErr) throw new Error(`upsertLicor fetch: ${fetchErr.message}`);
    return toLicorEntity(data);
  }
}
