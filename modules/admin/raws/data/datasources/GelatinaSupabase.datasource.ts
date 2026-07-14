import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Gelatina,
  GelatinaIngrediente,
  CreateGelatinaDTO,
  UpdateGelatinaDTO,
} from "../../domain/entities/Gelatina.entity";
import type {
  GelatinaFilters,
  PaginatedResult,
} from "../../domain/repositories/Gelatina.repository";

const TABLE = "gelatina_ingredientes";

function toIng(row: any): GelatinaIngrediente {
  const costo = Number(row.ingredientes?.costo_unidad_minima ?? 0);
  const cantidad = Number(row.cantidad);
  return {
    id: row.id,
    gelatinaId: row.gelatina_id,
    ingredienteId: row.ingrediente_id,
    ingredienteNombre: row.ingredientes?.nombre ?? "",
    ingredienteUnidad: row.ingredientes?.unidad_base ?? "",
    cantidad,
    costoCalculado: cantidad * costo,
  };
}

function buildGelatinas(rows: any[]): Gelatina[] {
  const map = new Map<string, { nombre: string; activo: boolean; rows: any[] }>();
  for (const r of rows) {
    if (!map.has(r.gelatina_id)) {
      map.set(r.gelatina_id, { nombre: r.nombre, activo: r.activo, rows: [] });
    }
    map.get(r.gelatina_id)!.rows.push(r);
  }
  return Array.from(map.entries()).map(([id, g]) => {
    const ings = g.rows.map(toIng);
    return {
      id,
      nombre: g.nombre,
      activo: g.activo,
      costoTotal: ings.reduce((s, i) => s + i.costoCalculado, 0),
      ingredientes: ings,
    };
  });
}

export class GelatinaSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: GelatinaFilters): Promise<PaginatedResult<Gelatina>> {
    const { search, page = 1, pageSize = 20 } = filters;

    let q = this.db
      .from(TABLE)
      .select("*, ingredientes(nombre, unidad_base, costo_unidad_minima)")
      .order("nombre");

    if (search) q = q.ilike("nombre", `%${search}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(`findAll gelatinas: ${error.message}`);

    const all = buildGelatinas(rows ?? []);
    const from = (page - 1) * pageSize;
    return {
      data: all.slice(from, from + pageSize),
      total: all.length,
      page,
      pageSize,
      totalPages: Math.ceil(all.length / pageSize),
    };
  }

  async findById(id: string): Promise<Gelatina | null> {
    const { data: rows, error } = await this.db
      .from(TABLE)
      .select("*, ingredientes(nombre, unidad_base, costo_unidad_minima)")
      .eq("gelatina_id", id);
    if (error) throw new Error(`findById gelatina: ${error.message}`);
    return buildGelatinas(rows ?? [])[0] ?? null;
  }

  async create(dto: CreateGelatinaDTO): Promise<Gelatina> {
    if (!dto.ingredientes.length) throw new Error("Agrega al menos un ingrediente");

    const gelatinaId = crypto.randomUUID();
    const activo = dto.activo ?? true;

    const { error } = await this.db.from(TABLE).insert(
      dto.ingredientes.map((i) => ({
        gelatina_id: gelatinaId,
        nombre: dto.nombre,
        ingrediente_id: i.ingredienteId,
        cantidad: i.cantidad,
        activo,
      })),
    );
    if (error) throw new Error(`create gelatina: ${error.message}`);

    return this.findById(gelatinaId) as Promise<Gelatina>;
  }

  async update(id: string, dto: UpdateGelatinaDTO): Promise<Gelatina> {
    const db = this.db;

    const { data: current } = await db
      .from(TABLE)
      .select("nombre, activo")
      .eq("gelatina_id", id)
      .limit(1);
    const currentNombre = current?.[0]?.nombre ?? "";
    const currentActivo = current?.[0]?.activo ?? true;
    const newNombre = dto.nombre ?? currentNombre;
    const newActivo = dto.activo ?? currentActivo;

    // Update nombre/activo on all existing rows
    const headerUpdates: Record<string, any> = {};
    if (dto.nombre !== undefined) headerUpdates.nombre = dto.nombre;
    if (dto.activo !== undefined) headerUpdates.activo = dto.activo;
    if (Object.keys(headerUpdates).length > 0) {
      const { error } = await db.from(TABLE).update(headerUpdates).eq("gelatina_id", id);
      if (error) throw new Error(`update gelatina: ${error.message}`);
    }

    // Replace ingredients if provided
    if (dto.ingredientes !== undefined) {
      await db.from(TABLE).delete().eq("gelatina_id", id);
      if (dto.ingredientes.length > 0) {
        const { error } = await db.from(TABLE).insert(
          dto.ingredientes.map((i) => ({
            gelatina_id: id,
            nombre: newNombre,
            ingrediente_id: i.ingredienteId,
            cantidad: i.cantidad,
            activo: newActivo,
          })),
        );
        if (error) throw new Error(`update ingredientes: ${error.message}`);
      }
    }

    return this.findById(id) as Promise<Gelatina>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("gelatina_id", id);
    if (error) throw new Error(`delete gelatina: ${error.message}`);
  }
}
