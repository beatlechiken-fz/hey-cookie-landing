// src/modules/admin/store/data/datasources/Cupon.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Cupon,
  CreateCuponDTO,
  UpdateCuponDTO,
} from "../../domain/entities/Cupon.entity";

const TABLE = "cupones";
const TABLE_M2M = "cupon_clientes";

function toEntity(row: any): Cupon {
  return {
    id: row.id,
    codigo: row.codigo,
    descripcion: row.descripcion ?? null,
    tipo: row.tipo ?? "global",
    tipoDescuento: row.tipo_descuento,
    valor: Number(row.valor),
    usosMaximos: row.usos_maximos != null ? Number(row.usos_maximos) : null,
    usosActuales: Number(row.usos_actuales ?? 0),
    fechaInicio: row.fecha_inicio ?? null,
    fechaFin: row.fecha_fin ?? null,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(dto: Partial<CreateCuponDTO>) {
  const row: Record<string, any> = {};
  if (dto.codigo !== undefined) row.codigo = dto.codigo.trim().toUpperCase();
  if (dto.descripcion !== undefined) row.descripcion = dto.descripcion;
  if (dto.tipo !== undefined) row.tipo = dto.tipo;
  if (dto.tipoDescuento !== undefined) row.tipo_descuento = dto.tipoDescuento;
  if (dto.valor !== undefined) row.valor = dto.valor;
  if (dto.usosMaximos !== undefined) row.usos_maximos = dto.usosMaximos;
  if (dto.fechaInicio !== undefined) row.fecha_inicio = dto.fechaInicio;
  if (dto.fechaFin !== undefined) row.fecha_fin = dto.fechaFin;
  return row;
}

export interface CuponFilters {
  search?: string;
  activo?: boolean;
  tipo?: "global" | "individual";
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

export class CuponSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: CuponFilters): Promise<PaginatedResult<Cupon>> {
    const { search, activo = true, tipo, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db.from(TABLE).select("*", { count: "exact" });
    if (search) q = q.ilike("codigo", `%${search}%`);
    if (activo !== undefined) q = q.eq("activo", activo);
    if (tipo) q = q.eq("tipo", tipo);
    q = q
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(`findAll cupones: ${error.message}`);
    return {
      data: (data ?? []).map(toEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Cupon | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById cupon: ${error.message}`);
    return toEntity(data);
  }

  /** Busca un cupón por código exacto (case-insensitive), para validación al aplicar */
  async findByCodigo(codigo: string): Promise<Cupon | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .ilike("codigo", codigo.trim())
      .maybeSingle();
    if (error) throw new Error(`findByCodigo cupon: ${error.message}`);
    return data ? toEntity(data) : null;
  }

  async create(dto: CreateCuponDTO): Promise<Cupon> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(toRow(dto))
      .select()
      .single();
    if (error) throw new Error(`create cupon: ${error.message}`);
    return toEntity(data);
  }

  async update(id: string, dto: UpdateCuponDTO): Promise<Cupon> {
    const { data, error } = await this.db
      .from(TABLE)
      .update(toRow(dto))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update cupon: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete cupon: ${error.message}`);
  }

  async incrementarUso(id: string): Promise<void> {
    const { data: cur, error: e1 } = await this.db
      .from(TABLE)
      .select("usos_actuales")
      .eq("id", id)
      .single();
    if (e1) throw new Error(`incrementarUso fetch: ${e1.message}`);
    const { error: e2 } = await this.db
      .from(TABLE)
      .update({ usos_actuales: (cur?.usos_actuales ?? 0) + 1 })
      .eq("id", id);
    if (e2) throw new Error(`incrementarUso update: ${e2.message}`);
  }

  // ── Relación m2m: cupon_clientes ──────────────────────────────────────────

  /** Cupones (con info de asignación) asignados a un cliente específico */
  async findAsignadosByCliente(clienteId: string): Promise<Cupon[]> {
    const { data, error } = await this.db
      .from(TABLE_M2M)
      .select("usado, usado_en, cupones(*)")
      .eq("cliente_id", clienteId);
    if (error) throw new Error(`findAsignadosByCliente: ${error.message}`);

    return (data ?? [])
      .filter((row: any) => row.cupones)
      .map((row: any) => ({
        ...toEntity(row.cupones),
        asignadoCliente: { usado: row.usado, usadoEn: row.usado_en ?? null },
      }));
  }

  /** Cupones individuales activos que NO están asignados a este cliente todavía */
  async findDisponiblesParaCliente(
    clienteId: string,
    search?: string,
  ): Promise<Cupon[]> {
    // 1. IDs ya asignados a este cliente
    const { data: asignados, error: e1 } = await this.db
      .from(TABLE_M2M)
      .select("cupon_id")
      .eq("cliente_id", clienteId);
    if (e1) throw new Error(`findDisponibles asignados: ${e1.message}`);
    const asignadosIds = (asignados ?? []).map((r: any) => r.cupon_id);

    // 2. Cupones individuales activos, excluyendo los ya asignados
    let q = this.db
      .from(TABLE)
      .select("*")
      .eq("tipo", "individual")
      .eq("activo", true);
    if (asignadosIds.length > 0)
      q = q.not("id", "in", `(${asignadosIds.join(",")})`);
    if (search) q = q.ilike("codigo", `%${search}%`);
    q = q.order("created_at", { ascending: false }).limit(50);

    const { data, error } = await q;
    if (error) throw new Error(`findDisponiblesParaCliente: ${error.message}`);
    return (data ?? []).map(toEntity);
  }

  /** Asigna un cupón individual a un cliente (m2m, idempotente) */
  async asignarACliente(cuponId: string, clienteId: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE_M2M)
      .insert({ cupon_id: cuponId, cliente_id: clienteId });
    if (error) {
      // Unique violation = ya estaba asignado, lo tratamos como éxito idempotente
      if (error.code === "23505") return;
      throw new Error(`asignarACliente: ${error.message}`);
    }
  }

  /** Quita la asignación de un cupón a un cliente */
  async desasignarDeCliente(cuponId: string, clienteId: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE_M2M)
      .delete()
      .eq("cupon_id", cuponId)
      .eq("cliente_id", clienteId);
    if (error) throw new Error(`desasignarDeCliente: ${error.message}`);
  }

  /** ¿Este cupón está asignado a este cliente? */
  async estaAsignado(cuponId: string, clienteId: string): Promise<boolean> {
    const { data, error } = await this.db
      .from(TABLE_M2M)
      .select("id")
      .eq("cupon_id", cuponId)
      .eq("cliente_id", clienteId)
      .maybeSingle();
    if (error) throw new Error(`estaAsignado: ${error.message}`);
    return Boolean(data);
  }

  /** Marca como usado el cupón para este cliente (cuando se aplica en una orden) */
  async marcarUsadoPorCliente(
    cuponId: string,
    clienteId: string,
  ): Promise<void> {
    const { error } = await this.db
      .from(TABLE_M2M)
      .update({ usado: true, usado_en: new Date().toISOString() })
      .eq("cupon_id", cuponId)
      .eq("cliente_id", clienteId);
    if (error) throw new Error(`marcarUsadoPorCliente: ${error.message}`);
  }
}
