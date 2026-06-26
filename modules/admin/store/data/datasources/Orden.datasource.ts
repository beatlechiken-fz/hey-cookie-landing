// src/modules/admin/store/data/datasources/Orden.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Orden,
  OrdenItem,
  OrdenCuponAplicado,
  CreateOrdenDTO,
  OrdenStatus,
} from "../../domain/entities/Orden.entity";

const TABLE = "ordenes";
const TABLE_ITEMS = "orden_items";
const TABLE_CUPONS = "orden_cupones";

function toItemEntity(row: any): OrdenItem {
  return {
    id: row.id,
    tipo: row.tipo,
    nombre: row.nombre,
    configuracion: row.configuracion,
    cantidad: Number(row.cantidad),
    costoUnitario: Number(row.costo_unitario),
    precioUnitario: Number(row.precio_unitario),
    subtotal: Number(row.subtotal),
  };
}

function toCuponEntity(row: any): OrdenCuponAplicado {
  return {
    id: row.id,
    cuponId: row.cupon_id,
    codigo: row.codigo,
    tipoDescuento: row.tipo_descuento,
    valor: Number(row.valor),
    montoDescontado: Number(row.monto_descontado),
  };
}

function toEntity(
  row: any,
  items: OrdenItem[],
  cupones: OrdenCuponAplicado[],
): Orden {
  return {
    id: row.id,
    numero: Number(row.numero),
    clienteId: row.cliente_id ?? null,
    clienteNombre: row.clientes?.nombre ?? null,
    status: row.status,
    subtotal: Number(row.subtotal),
    descuentoTotal: Number(row.descuento_total),
    total: Number(row.total),
    notas: row.notas ?? null,
    fechaEntrega: row.fecha_entrega ?? null,
    items,
    cupones,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface OrdenFilters {
  status?: OrdenStatus;
  clienteId?: string;
  search?: string;
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

export class OrdenSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: OrdenFilters): Promise<PaginatedResult<Orden>> {
    const { status, clienteId, search, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db
      .from(TABLE)
      .select("*, clientes(nombre)", { count: "exact" });
    if (status) q = q.eq("status", status);
    if (clienteId) q = q.eq("cliente_id", clienteId);
    if (search) {
      const s = search.trim();
      if (/^\d+$/.test(s)) {
        q = q.eq("numero", parseInt(s));
      } else {
        q = q.ilike("cliente_nombre", `%${s}%`);
      }
    }
    q = q
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(`findAll ordenes: ${error.message}`);

    const ids = (rows ?? []).map((r: any) => r.id);
    const itemsMap: Record<string, OrdenItem[]> = {};
    const cuponesMap: Record<string, OrdenCuponAplicado[]> = {};

    if (ids.length > 0) {
      const [{ data: itemRows, error: ie }, { data: cupRows, error: ce }] =
        await Promise.all([
          this.db.from(TABLE_ITEMS).select("*").in("orden_id", ids),
          this.db.from(TABLE_CUPONS).select("*").in("orden_id", ids),
        ]);
      if (ie) throw new Error(`findAll items: ${ie.message}`);
      if (ce) throw new Error(`findAll cupones: ${ce.message}`);
      for (const r of itemRows ?? [])
        (itemsMap[r.orden_id] ??= []).push(toItemEntity(r));
      for (const r of cupRows ?? [])
        (cuponesMap[r.orden_id] ??= []).push(toCuponEntity(r));
    }

    return {
      data: (rows ?? []).map((r: any) =>
        toEntity(r, itemsMap[r.id] ?? [], cuponesMap[r.id] ?? []),
      ),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Orden | null> {
    const { data: row, error } = await this.db
      .from(TABLE)
      .select("*, clientes(nombre)")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById orden: ${error.message}`);

    const [{ data: itemRows, error: ie }, { data: cupRows, error: ce }] =
      await Promise.all([
        this.db.from(TABLE_ITEMS).select("*").eq("orden_id", id),
        this.db.from(TABLE_CUPONS).select("*").eq("orden_id", id),
      ]);
    if (ie) throw new Error(`findById items: ${ie.message}`);
    if (ce) throw new Error(`findById cupones: ${ce.message}`);

    return toEntity(
      row,
      (itemRows ?? []).map(toItemEntity),
      (cupRows ?? []).map(toCuponEntity),
    );
  }

  async create(dto: CreateOrdenDTO): Promise<Orden> {
    const db = this.db;

    const subtotal = dto.items.reduce((s, i) => s + i.subtotal, 0);
    const descuentoTotal = dto.cupones.reduce(
      (s, c) => s + c.montoDescontado,
      0,
    );
    const total = Math.max(0, subtotal - descuentoTotal);

    const { data: orden, error } = await db
      .from(TABLE)
      .insert({
        cliente_id: dto.clienteId ?? null,
        status: dto.status,
        subtotal,
        descuento_total: descuentoTotal,
        total,
        notas: dto.notas ?? null,
        fecha_entrega: dto.fechaEntrega ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`create orden: ${error.message}`);

    if (dto.items.length > 0) {
      const rows = dto.items.map((i) => ({
        orden_id: orden.id,
        tipo: i.tipo,
        nombre: i.nombre,
        configuracion: i.configuracion,
        cantidad: i.cantidad,
        costo_unitario: i.costoUnitario,
        precio_unitario: i.precioUnitario,
        subtotal: i.subtotal,
        desglose_costos: i.desgloseCostos ?? null,
      }));
      const { error: ie } = await db.from(TABLE_ITEMS).insert(rows);
      if (ie) throw new Error(`create orden_items: ${ie.message}`);
    }

    if (dto.cupones.length > 0) {
      const rows = dto.cupones.map((c) => ({
        orden_id: orden.id,
        cupon_id: c.cuponId,
        codigo: c.codigo,
        tipo_descuento: c.tipoDescuento,
        valor: c.valor,
        monto_descontado: c.montoDescontado,
      }));
      const { error: ce } = await db.from(TABLE_CUPONS).insert(rows);
      if (ce) throw new Error(`create orden_cupones: ${ce.message}`);

      // Incrementar usos_actuales de cada cupón aplicado
      for (const c of dto.cupones) {
        const { data: cur } = await db
          .from("cupones")
          .select("usos_actuales, tipo")
          .eq("id", c.cuponId)
          .single();
        await db
          .from("cupones")
          .update({ usos_actuales: (cur?.usos_actuales ?? 0) + 1 })
          .eq("id", c.cuponId);

        // Si es un cupón individual y la orden tiene cliente, marcar la asignación como usada
        if (cur?.tipo === "individual" && dto.clienteId) {
          await db
            .from("cupon_clientes")
            .update({ usado: true, usado_en: new Date().toISOString() })
            .eq("cupon_id", c.cuponId)
            .eq("cliente_id", dto.clienteId);
        }
      }
    }

    return this.findById(orden.id) as Promise<Orden>;
  }

  async updateStatus(id: string, status: OrdenStatus): Promise<Orden> {
    const { error } = await this.db.from(TABLE).update({ status }).eq("id", id);
    if (error) throw new Error(`updateStatus orden: ${error.message}`);
    return this.findById(id) as Promise<Orden>;
  }

  async updateFechaEntrega(
    id: string,
    fechaEntrega: string | null,
  ): Promise<Orden> {
    const { error } = await this.db
      .from(TABLE)
      .update({ fecha_entrega: fechaEntrega })
      .eq("id", id);
    if (error) throw new Error(`updateFechaEntrega orden: ${error.message}`);
    return this.findById(id) as Promise<Orden>;
  }
}
