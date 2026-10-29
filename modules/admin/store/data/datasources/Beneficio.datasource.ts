// src/modules/admin/store/data/datasources/Beneficio.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Beneficio,
  BeneficioOtorgamiento,
  UpdateBeneficioDTO,
} from "../../domain/entities/Beneficio.entity";

const TABLE = "beneficios";
const TABLE_OTORGAMIENTOS = "beneficio_otorgamientos";

function toEntity(row: any): Beneficio {
  return {
    id: row.id,
    tipo: row.tipo,
    activo: row.activo,
    config: row.config ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOtorgamientoEntity(row: any): BeneficioOtorgamiento {
  return {
    id: row.id,
    beneficioId: row.beneficio_id,
    clienteId: row.cliente_id,
    clienteNombre: row.clientes?.nombre ?? null,
    anio: Number(row.anio),
    cuponId: row.cupon_id ?? null,
    cuponCodigo: row.cupones?.codigo ?? null,
    createdAt: row.created_at,
  };
}

export class BeneficioSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(): Promise<Beneficio[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(`findAll beneficios: ${error.message}`);
    return (data ?? []).map(toEntity);
  }

  async findByTipo(tipo: string): Promise<Beneficio | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("tipo", tipo)
      .maybeSingle();
    if (error) throw new Error(`findByTipo beneficio: ${error.message}`);
    return data ? toEntity(data) : null;
  }

  async updateByTipo(tipo: string, dto: UpdateBeneficioDTO): Promise<Beneficio> {
    const current = await this.findByTipo(tipo);
    if (!current) throw new Error(`Beneficio "${tipo}" no encontrado`);

    const patch: Record<string, any> = {};
    if (dto.activo !== undefined) patch.activo = dto.activo;
    if (dto.config !== undefined) {
      patch.config = { ...current.config, ...dto.config };
    }

    const { data, error } = await this.db
      .from(TABLE)
      .update(patch)
      .eq("tipo", tipo)
      .select()
      .single();
    if (error) throw new Error(`updateByTipo beneficio: ${error.message}`);
    return toEntity(data);
  }

  /** Últimos otorgamientos de un beneficio, con el nombre del cliente y el código del cupón. */
  async listOtorgamientos(
    beneficioId: string,
    limit = 20,
  ): Promise<BeneficioOtorgamiento[]> {
    const { data, error } = await this.db
      .from(TABLE_OTORGAMIENTOS)
      .select("*, clientes(nombre), cupones(codigo)")
      .eq("beneficio_id", beneficioId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`listOtorgamientos: ${error.message}`);
    return (data ?? []).map(toOtorgamientoEntity);
  }

  /** ¿Ya se otorgó este beneficio a este cliente en este año? */
  async yaOtorgadoEnAnio(
    beneficioId: string,
    clienteId: string,
    anio: number,
  ): Promise<boolean> {
    const { data, error } = await this.db
      .from(TABLE_OTORGAMIENTOS)
      .select("id")
      .eq("beneficio_id", beneficioId)
      .eq("cliente_id", clienteId)
      .eq("anio", anio)
      .maybeSingle();
    if (error) throw new Error(`yaOtorgadoEnAnio: ${error.message}`);
    return Boolean(data);
  }

  async registrarOtorgamiento(params: {
    beneficioId: string;
    clienteId: string;
    anio: number;
    cuponId: string;
  }): Promise<void> {
    const { error } = await this.db.from(TABLE_OTORGAMIENTOS).insert({
      beneficio_id: params.beneficioId,
      cliente_id: params.clienteId,
      anio: params.anio,
      cupon_id: params.cuponId,
    });
    if (error) throw new Error(`registrarOtorgamiento: ${error.message}`);
  }

  /** Clientes activos con fecha de nacimiento registrada (para filtrar cumpleaños en memoria). */
  async findClientesConFechaNacimiento(): Promise<
    { id: string; nombre: string; fechaNacimiento: string }[]
  > {
    const { data, error } = await this.db
      .from("clientes")
      .select("id, nombre, fecha_nacimiento")
      .eq("activo", true)
      .not("fecha_nacimiento", "is", null);
    if (error) throw new Error(`findClientesConFechaNacimiento: ${error.message}`);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      fechaNacimiento: r.fecha_nacimiento,
    }));
  }
}
