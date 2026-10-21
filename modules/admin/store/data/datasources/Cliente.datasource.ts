// src/modules/admin/clientes/data/datasources/Cliente.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
} from "../../domain/entities/Cliente.entity";
import type {
  ClienteFilters,
  PaginatedResult,
} from "../../domain/repositories/Cliente.repository";

const TABLE = "clientes";

function toEntity(row: any): Cliente {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono ?? null,
    email: row.email ?? null,
    direccion: row.direccion ?? null,
    notas: row.notas ?? null,
    fechaNacimiento: row.fecha_nacimiento ?? null,
    authUserId: row.auth_user_id ?? null,
    activo: row.activo,
    ...(row.ordenes ? { totalOrdenes: Number(row.ordenes[0]?.count ?? 0) } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(dto: Partial<CreateClienteDTO>) {
  const row: Record<string, any> = {};
  if (dto.nombre !== undefined) row.nombre = dto.nombre;
  if (dto.telefono !== undefined) row.telefono = dto.telefono;
  if (dto.email !== undefined) row.email = dto.email;
  if (dto.direccion !== undefined) row.direccion = dto.direccion;
  if (dto.notas !== undefined) row.notas = dto.notas;
  if (dto.fechaNacimiento !== undefined)
    row.fecha_nacimiento = dto.fechaNacimiento || null;
  return row;
}

export class ClienteSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: ClienteFilters): Promise<PaginatedResult<Cliente>> {
    const { search, activo = true, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    // ordenes(count) agrega el número de órdenes por cliente (sin canceladas).
    let q = this.db
      .from(TABLE)
      .select("*, ordenes(count)", { count: "exact" })
      .neq("ordenes.status", "cancelado");
    if (search)
      q = q.or(
        `nombre.ilike.%${search}%,telefono.ilike.%${search}%,email.ilike.%${search}%`,
      );
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q.order("nombre").range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(`findAll clientes: ${error.message}`);
    return {
      data: (data ?? []).map(toEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Cliente | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById cliente: ${error.message}`);
    return toEntity(data);
  }

  async create(dto: CreateClienteDTO): Promise<Cliente> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(toRow(dto))
      .select()
      .single();
    if (error) throw new Error(`create cliente: ${error.message}`);
    return toEntity(data);
  }

  async update(id: string, dto: UpdateClienteDTO): Promise<Cliente> {
    const { data, error } = await this.db
      .from(TABLE)
      .update(toRow(dto))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update cliente: ${error.message}`);
    return toEntity(data);
  }

  async findContactoDuplicado(
    contacto: { email: string | null; telefono: string | null },
    excludeId: string,
  ): Promise<"email" | "telefono" | null> {
    if (contacto.email) {
      const { data, error } = await this.db
        .from(TABLE)
        .select("id, email")
        .eq("activo", true)
        .neq("id", excludeId)
        .ilike("email", contacto.email.replace(/[%_\\]/g, "\\$&"));
      if (error) throw new Error(`duplicado email: ${error.message}`);
      if ((data ?? []).length > 0) return "email";
    }
    if (contacto.telefono) {
      // Los teléfonos se guardan con formatos distintos: se comparan los últimos 10 dígitos.
      const digitos = contacto.telefono.replace(/\D/g, "").slice(-10);
      const { data, error } = await this.db
        .from(TABLE)
        .select("id, telefono")
        .eq("activo", true)
        .neq("id", excludeId)
        .not("telefono", "is", null)
        .ilike("telefono", `%${digitos.slice(-4)}%`);
      if (error) throw new Error(`duplicado teléfono: ${error.message}`);
      const choca = (data ?? []).some(
        (r: { telefono: string }) =>
          r.telefono.replace(/\D/g, "").slice(-10) === digitos,
      );
      if (choca) return "telefono";
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete cliente: ${error.message}`);
  }
}
