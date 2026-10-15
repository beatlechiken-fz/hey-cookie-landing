// src/modules/admin/store/data/datasources/ClienteEnlaceEdicionSupabase.datasource.ts

import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { ClienteEnlaceEdicion } from "../../domain/entities/ClienteEnlaceEdicion.entity";

const TABLE = "cliente_enlaces_edicion";
const VENTANA_MS = 24 * 60 * 60 * 1000;

interface EnlaceRow {
  id: string;
  cliente_id: string;
  token: string;
  expira_at: string;
  revocado: boolean;
  ediciones: number;
  ventana_inicio: string | null;
  ventana_ediciones: number;
  ultimo_uso_at: string | null;
  created_at: string;
}

function toEntity(r: EnlaceRow): ClienteEnlaceEdicion {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    token: r.token,
    expiraAt: r.expira_at,
    revocado: !!r.revocado,
    ediciones: r.ediciones ?? 0,
    ventanaInicio: r.ventana_inicio ?? null,
    ventanaEdiciones: r.ventana_ediciones ?? 0,
    ultimoUsoAt: r.ultimo_uso_at ?? null,
    createdAt: r.created_at,
  };
}

/** 256 bits aleatorios: imposible de adivinar o enumerar. */
function nuevoToken(): string {
  return randomBytes(32).toString("base64url");
}

export class ClienteEnlaceEdicionSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findByToken(token: string): Promise<ClienteEnlaceEdicion | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("token", token)
      .maybeSingle();
    if (error) throw new Error(`findByToken enlace: ${error.message}`);
    return data ? toEntity(data as EnlaceRow) : null;
  }

  async findVigenteByCliente(clienteId: string): Promise<ClienteEnlaceEdicion | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("cliente_id", clienteId)
      .eq("revocado", false)
      .gt("expira_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`findVigente enlace: ${error.message}`);
    return data ? toEntity(data as EnlaceRow) : null;
  }

  async findVigentesByClientes(clienteIds: string[]): Promise<ClienteEnlaceEdicion[]> {
    if (clienteIds.length === 0) return [];
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .in("cliente_id", clienteIds)
      .eq("revocado", false)
      .gt("expira_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) throw new Error(`findVigentes enlaces: ${error.message}`);
    return (data ?? []).map((r) => toEntity(r as EnlaceRow));
  }

  async create(clienteId: string, expiraAt: Date): Promise<ClienteEnlaceEdicion> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert({ cliente_id: clienteId, token: nuevoToken(), expira_at: expiraAt.toISOString() })
      .select()
      .single();
    if (error) throw new Error(`create enlace: ${error.message}`);
    return toEntity(data as EnlaceRow);
  }

  async revocarDeCliente(clienteId: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ revocado: true })
      .eq("cliente_id", clienteId)
      .eq("revocado", false);
    if (error) throw new Error(`revocar enlaces: ${error.message}`);
  }

  async registrarEdicion(enlace: ClienteEnlaceEdicion, maxPorDia: number): Promise<boolean> {
    const ahora = new Date();
    const ventanaVencida =
      !enlace.ventanaInicio ||
      ahora.getTime() - new Date(enlace.ventanaInicio).getTime() > VENTANA_MS;
    const enVentana = ventanaVencida ? 0 : enlace.ventanaEdiciones;
    if (enVentana >= maxPorDia) return false;

    // Actualización optimista: si otra petición sumó antes, no coincide y se rechaza.
    const { data, error } = await this.db
      .from(TABLE)
      .update({
        ediciones: enlace.ediciones + 1,
        ventana_inicio: ventanaVencida ? ahora.toISOString() : enlace.ventanaInicio,
        ventana_ediciones: enVentana + 1,
        ultimo_uso_at: ahora.toISOString(),
      })
      .eq("id", enlace.id)
      .eq("ediciones", enlace.ediciones)
      .select("id");
    if (error) throw new Error(`registrar edición: ${error.message}`);
    return (data ?? []).length === 1;
  }
}
