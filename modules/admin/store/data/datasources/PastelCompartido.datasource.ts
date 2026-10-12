// src/modules/admin/store/data/datasources/PastelCompartido.datasource.ts

import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import {
  describirProductoCompartido,
  type ConfigCompartible,
  NOMBRE_PARTICIPANTE_MAX,
  type NombresCatalogo,
  type OrigenParticipante,
  type PastelCompartido,
  type PastelCompartidoPublico,
  type PastelParticipante,
} from "../../domain/entities/PastelCompartido.entity";
import { personasDesdeDiametro } from "../../domain/entities/PastelMedida.entity";

const TABLE = "pastel_compartido";
const TABLE_PART = "pastel_participantes";

interface ParticipanteRow {
  id: string;
  nombre: string | null;
  participa: boolean;
  origen: string;
  created_at: string;
}

interface CompartidoRow {
  id: string;
  orden_id: string;
  orden_item_id: string;
  token: string;
  solicitante_nombre: string | null;
  producto_nombre: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  pastel_participantes?: ParticipanteRow[] | null;
}

/** Relación embebida participante → enlace, para validar a qué orden pertenece. */
interface ParticipanteConOrden {
  pastel_compartido?: { orden_id?: string } | null;
}

function toParticipante(r: ParticipanteRow): PastelParticipante {
  return {
    id: r.id,
    nombre: r.nombre ?? null,
    participa: !!r.participa,
    origen: r.origen as OrigenParticipante,
    createdAt: r.created_at,
  };
}

function toEntity(r: CompartidoRow): PastelCompartido {
  return {
    id: r.id,
    ordenId: r.orden_id,
    ordenItemId: r.orden_item_id,
    token: r.token,
    solicitanteNombre: r.solicitante_nombre ?? null,
    productoNombre: r.producto_nombre ?? null,
    descripcion: r.descripcion ?? null,
    imagenUrl: r.imagen_url ?? null,
    activo: !!r.activo,
    participantes: (r.pastel_participantes ?? [])
      .map(toParticipante)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    createdAt: r.created_at,
  };
}

const SELECT = "*, pastel_participantes(*)";

function nuevoToken(): string {
  return randomBytes(16).toString("base64url");
}

function limpiarNombre(nombre: unknown): string {
  if (typeof nombre !== "string") throw new Error("Escribe un nombre");
  const n = nombre.trim().replace(/\s+/g, " ");
  if (!n) throw new Error("Escribe un nombre");
  if (n.length > NOMBRE_PARTICIPANTE_MAX)
    throw new Error(`El nombre no puede pasar de ${NOMBRE_PARTICIPANTE_MAX} caracteres`);
  return n;
}

export class PastelCompartidoSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findByOrden(ordenId: string): Promise<PastelCompartido[]> {
    const { data, error } = await this.db
      .from(TABLE)
      .select(SELECT)
      .eq("orden_id", ordenId)
      .order("created_at");
    if (error) throw new Error(`findByOrden compartido: ${error.message}`);
    return (data ?? []).map(toEntity);
  }

  /**
   * Genera (o devuelve, si ya existe) el enlace para compartir una partida de
   * la orden. Solo aplica a partidas marcadas con `configuracion.compartir`.
   * El solicitante entra como primer participante; el admin puede quitarlo.
   */
  async crearParaItem(ordenId: string, ordenItemId: string): Promise<PastelCompartido> {
    const db = this.db;
    const { data: existente } = await db
      .from(TABLE)
      .select(SELECT)
      .eq("orden_item_id", ordenItemId)
      .maybeSingle();
    if (existente) return toEntity(existente);

    const [{ data: item, error: ie }, { data: orden, error: oe }] = await Promise.all([
      db.from("orden_items").select("id, orden_id, nombre, configuracion").eq("id", ordenItemId).single(),
      db.from("ordenes").select("id, cliente_nombre").eq("id", ordenId).single(),
    ]);
    if (ie || !item) throw new Error("Partida no encontrada");
    if (oe || !orden) throw new Error("Orden no encontrada");
    if (item.orden_id !== ordenId) throw new Error("La partida no pertenece a esta orden");
    const conf = (item.configuracion ?? {}) as ConfigCompartible;
    if (!conf.compartir) throw new Error("Esta partida no se marcó para compartir");

    const descripcion = describirProductoCompartido(
      conf,
      await this.nombresCatalogo(conf),
      conf.diametroCm ? personasDesdeDiametro(conf.diametroCm) : null,
    );
    const solicitante = conf.datos?.nombre?.trim() || orden.cliente_nombre || null;

    const { data: creado, error } = await db
      .from(TABLE)
      .insert({
        orden_id: ordenId,
        orden_item_id: ordenItemId,
        token: nuevoToken(),
        solicitante_nombre: solicitante,
        producto_nombre: item.nombre,
        descripcion,
        imagen_url: conf.fotoRef ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(`crear compartido: ${error.message}`);

    const { error: pe } = await db.from(TABLE_PART).insert({
      compartido_id: creado.id,
      nombre: solicitante,
      participa: true,
      origen: "solicitante",
    });
    if (pe) throw new Error(`agregar solicitante: ${pe.message}`);

    return this.findById(creado.id);
  }

  async findById(id: string): Promise<PastelCompartido> {
    const { data, error } = await this.db.from(TABLE).select(SELECT).eq("id", id).single();
    if (error || !data) throw new Error("Enlace no encontrado");
    return toEntity(data);
  }

  async findPublicoByToken(token: string): Promise<PastelCompartidoPublico | null> {
    const { data } = await this.db
      .from(TABLE)
      .select("solicitante_nombre, producto_nombre, descripcion, imagen_url, activo, orden_items(configuracion)")
      .eq("token", token)
      .maybeSingle();
    if (!data) return null;
    const embebido = data as unknown as { orden_items?: { configuracion?: ConfigCompartible } | null };
    const conf = embebido.orden_items?.configuracion ?? {};
    return {
      solicitanteNombre: data.solicitante_nombre ?? null,
      productoNombre: data.producto_nombre ?? null,
      descripcion: data.descripcion ?? null,
      imagenUrl: data.imagen_url ?? null,
      esGelatina: conf.tipo === "gelatina-custom",
      activo: !!data.activo,
    };
  }

  /** Respuesta del invitado desde la página pública. */
  async responder(token: string, participa: boolean, nombre: unknown): Promise<void> {
    const { data: comp } = await this.db
      .from(TABLE)
      .select("id, activo")
      .eq("token", token)
      .maybeSingle();
    if (!comp) throw new Error("Enlace no encontrado");
    if (!comp.activo) throw new Error("Este enlace ya no está activo");
    const { error } = await this.db.from(TABLE_PART).insert({
      compartido_id: comp.id,
      nombre: participa ? limpiarNombre(nombre) : null,
      participa,
      origen: "invitado",
    });
    if (error) throw new Error(`responder: ${error.message}`);
  }

  /** El admin agrega a alguien (o vuelve a agregar al solicitante). */
  async agregarParticipante(
    ordenId: string,
    compartidoId: string,
    nombre: unknown,
    origen: "admin" | "solicitante",
  ): Promise<void> {
    const comp = await this.findById(compartidoId);
    if (comp.ordenId !== ordenId) throw new Error("El enlace no pertenece a esta orden");
    if (origen === "solicitante" && comp.participantes.some((p) => p.origen === "solicitante" && p.participa))
      throw new Error("El solicitante ya está en la lista");
    const { error } = await this.db.from(TABLE_PART).insert({
      compartido_id: compartidoId,
      nombre: origen === "solicitante" ? comp.solicitanteNombre : limpiarNombre(nombre),
      participa: true,
      origen,
    });
    if (error) throw new Error(`agregar participante: ${error.message}`);
  }

  async eliminarParticipante(ordenId: string, participanteId: string): Promise<void> {
    const { data } = await this.db
      .from(TABLE_PART)
      .select("id, pastel_compartido!inner(orden_id)")
      .eq("id", participanteId)
      .maybeSingle();
    if (!data || (data as unknown as ParticipanteConOrden).pastel_compartido?.orden_id !== ordenId)
      throw new Error("Participante no encontrado");
    const { error } = await this.db.from(TABLE_PART).delete().eq("id", participanteId);
    if (error) throw new Error(`eliminar participante: ${error.message}`);
  }

  /** Nombres de bizcocho, coberturas, jarabe, sabores y toppings usados en la configuración. */
  private async nombresCatalogo(conf: ConfigCompartible): Promise<NombresCatalogo> {
    const db = this.db;
    type Sel = NonNullable<ConfigCompartible["coberturas"]>[number];
    const ids = (arr: Sel[] | undefined, key: keyof Sel) =>
      (arr ?? []).map((x) => x[key]).filter((x): x is string => typeof x === "string" && !!x);
    const cobIds = [...ids(conf.coberturas, "coberturaId"), ...ids(conf.rellenos, "rellenoId")];
    const saborIds = [...ids(conf.coberturas, "saborCoberturaId"), ...ids(conf.rellenos, "saborRellenoId")];
    const ingIds = ids(conf.toppings, "ingredienteId");

    const query = async (table: string, list: string[]) => {
      if (!list.length) return {};
      const { data } = await db.from(table).select("id, nombre").in("id", list);
      return Object.fromEntries(
        ((data ?? []) as { id: string; nombre: string }[]).map((r) => [r.id, r.nombre]),
      );
    };

    const [bizcochos, coberturas, sabores, jarabes, saboresJarabe, ingredientes] = await Promise.all([
      query("bizcochos", conf.bizcochoId ? [conf.bizcochoId] : []),
      query("coberturas", cobIds),
      query("sabores", saborIds),
      query("jarabes", conf.jarabeId ? [conf.jarabeId] : []),
      query("sabores_jarabe", conf.saborJarabeId ? [conf.saborJarabeId] : []),
      query("ingredientes", ingIds),
    ]);
    return { bizcochos, coberturas, sabores, jarabes, saboresJarabe, ingredientes };
  }
}
