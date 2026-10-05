// src/modules/admin/finanzas/data/datasources/Finanzas.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  FinanzasRegistro,
  CreateFinanzasRegistroDTO,
  UpdateFinanzasRegistroDTO,
  FinanzasMovimiento,
  CreateMovimientoDTO,
  FinanzasCompra,
  CreateCompraDTO,
  UpdateCompraDTO,
  CuentaMovimiento,
  ResumenFinanciero,
  SaldoCuenta,
} from "../../domain/entities/Finanzas.entity";
import { ORDEN_STATUS_FINANZAS } from "../../domain/entities/Orden.entity";
import {
  FILTROS_VACIOS,
  clasificarItem,
  desgloseItem,
  fraccion,
  hayFiltroProducto,
  itemCoincide,
  sumarDesgloses,
  type FinanzasFiltros,
  type ProductoClasif,
} from "@/core/helpers/finanzasFiltros";

const CHUNK = 100;

function chunk<T>(arr: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function toRegistro(r: any): FinanzasRegistro {
  return {
    id: r.id,
    ordenId: r.orden_id ?? null,
    ordenNumero: r.orden_numero ?? null,
    clienteNombre: r.cliente_nombre ?? null,
    fechaVenta: r.fecha_venta,
    totalVenta: Number(r.total_venta),
    insumos: Number(r.insumos),
    servicios: Number(r.servicios),
    manoDeObra: Number(r.mano_de_obra),
    utilidad: Number(r.utilidad),
    comision: r.comision != null ? Number(r.comision) : null,
    notas: r.notas ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toMovimiento(r: any): FinanzasMovimiento {
  return {
    id: r.id,
    fecha: r.fecha,
    tipo: r.tipo,
    cuenta: r.cuenta,
    concepto: r.concepto,
    monto: Number(r.monto),
    notas: r.notas ?? null,
    createdAt: r.created_at,
  };
}

function toCompra(r: any): FinanzasCompra {
  return {
    id: r.id,
    fecha: r.fecha,
    concepto: r.concepto,
    proveedor: r.proveedor ?? null,
    categoria: r.categoria ?? null,
    monto: Number(r.monto),
    notas: r.notas ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class FinanzasDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  // ── Registros ───────────────────────────────────────────────────────────────

  async getRegistros(
    desde?: string,
    hasta?: string,
  ): Promise<FinanzasRegistro[]> {
    let q = this.db
      .from("finanzas_registros")
      .select("*")
      .order("fecha_venta", { ascending: false });
    if (desde) q = q.gte("fecha_venta", desde);
    if (hasta) q = q.lte("fecha_venta", hasta);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toRegistro);
  }

  /**
   * Registros del período con los filtros de los dashboards de finanzas:
   *  - finanzas: "si" = orden marcada (y aún pagada/entregada), "no" = el resto
   *    (incluye registros manuales sin orden);
   *  - tipo/línea: reparte cada venta por producto y deja solo la parte de los
   *    items que coinciden (montos escalados, `parcial: true`). Los registros sin
   *    orden no tienen producto, así que quedan fuera con estos filtros.
   * Siempre anota `finanzas` en cada registro.
   */
  async getRegistrosFiltrados(
    desde?: string,
    hasta?: string,
    filtros: FinanzasFiltros = FILTROS_VACIOS,
  ): Promise<FinanzasRegistro[]> {
    const base = await this.getRegistros(desde, hasta);
    const db = this.db;

    // Órdenes de origen: flag y status
    const ordenIds = Array.from(
      new Set(base.map((r) => r.ordenId).filter((x): x is string => !!x)),
    );
    const ordenMap = new Map<string, { finanzas: boolean; status: string }>();
    for (const ids of chunk(ordenIds)) {
      const { data, error } = await db
        .from("ordenes")
        .select("id, finanzas, status")
        .in("id", ids);
      if (error) throw new Error(error.message);
      for (const o of data ?? [])
        ordenMap.set(o.id, { finanzas: !!o.finanzas, status: o.status });
    }

    const marcada = (r: FinanzasRegistro) => {
      const o = r.ordenId ? ordenMap.get(r.ordenId) : undefined;
      return !!o && o.finanzas && (ORDEN_STATUS_FINANZAS as string[]).includes(o.status);
    };

    let registros = base.map((r) => ({ ...r, finanzas: marcada(r) }));
    if (filtros.finanzas === "si") registros = registros.filter((r) => r.finanzas);
    if (filtros.finanzas === "no") registros = registros.filter((r) => !r.finanzas);

    if (!hayFiltroProducto(filtros)) return registros;

    // Tipo / línea: repartir cada venta por producto
    const ids = Array.from(
      new Set(registros.map((r) => r.ordenId).filter((x): x is string => !!x)),
    );
    const itemsPorOrden = new Map<string, any[]>();
    for (const part of chunk(ids)) {
      const { data, error } = await db
        .from("orden_items")
        .select("orden_id, configuracion, cantidad, costo_unitario, subtotal, desglose_costos")
        .in("orden_id", part);
      if (error) throw new Error(error.message);
      for (const it of data ?? []) {
        const list = itemsPorOrden.get(it.orden_id) ?? [];
        list.push(it);
        itemsPorOrden.set(it.orden_id, list);
      }
    }
    const { data: prods, error: pe } = await db
      .from("productos")
      .select("id, categoria, linea");
    if (pe) throw new Error(pe.message);
    const prodMap = new Map<string, ProductoClasif>(
      (prods ?? []).map((p: any) => [p.id, { categoria: p.categoria, linea: p.linea }]),
    );

    const out: FinanzasRegistro[] = [];
    for (const r of registros) {
      const items = r.ordenId ? itemsPorOrden.get(r.ordenId) : undefined;
      if (!items || items.length === 0) continue;

      const todos = items.map((it) => ({
        it,
        d: desgloseItem({
          cantidad: Number(it.cantidad),
          costoUnitario: Number(it.costo_unitario),
          subtotal: Number(it.subtotal),
          desgloseCostos: it.desglose_costos,
        }),
      }));
      const coinciden = todos.filter((x) =>
        itemCoincide(clasificarItem(x.it.configuracion, prodMap), filtros),
      );
      if (coinciden.length === 0) continue;

      if (coinciden.length === todos.length) {
        out.push(r);
        continue;
      }

      const t = sumarDesgloses(todos.map((x) => x.d));
      const m = sumarDesgloses(coinciden.map((x) => x.d));
      const fVenta = fraccion(m.venta, t.venta);
      const f = (a: number, b: number) => (b > 0 ? a / b : fVenta);
      out.push({
        ...r,
        totalVenta: round2(r.totalVenta * fVenta),
        insumos: round2(r.insumos * f(m.insumos, t.insumos)),
        servicios: round2(r.servicios * f(m.servicios, t.servicios)),
        manoDeObra: round2(r.manoDeObra * f(m.manoDeObra, t.manoDeObra)),
        utilidad: round2(r.utilidad * f(m.utilidad, t.utilidad)),
        comision: r.comision != null ? round2(r.comision * fVenta) : null,
        parcial: true,
      });
    }
    return out;
  }

  async getRegistroByOrdenId(
    ordenId: string,
  ): Promise<FinanzasRegistro | null> {
    const { data, error } = await this.db
      .from("finanzas_registros")
      .select("*")
      .eq("orden_id", ordenId)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(error.message);
    return toRegistro(data);
  }

  async createRegistro(
    dto: CreateFinanzasRegistroDTO,
  ): Promise<FinanzasRegistro> {
    const { data, error } = await this.db
      .from("finanzas_registros")
      .insert({
        orden_id: dto.ordenId ?? null,
        orden_numero: dto.ordenNumero ?? null,
        cliente_nombre: dto.clienteNombre ?? null,
        fecha_venta: dto.fechaVenta ?? new Date().toISOString().slice(0, 10),
        total_venta: dto.totalVenta,
        insumos: dto.insumos,
        servicios: dto.servicios,
        mano_de_obra: dto.manoDeObra,
        utilidad: dto.utilidad,
        comision: dto.comision ?? null,
        notas: dto.notas ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toRegistro(data);
  }

  async updateRegistro(
    id: string,
    dto: UpdateFinanzasRegistroDTO,
  ): Promise<FinanzasRegistro> {
    const patch: any = {};
    if (dto.fechaVenta !== undefined) patch.fecha_venta = dto.fechaVenta;
    if (dto.totalVenta !== undefined) patch.total_venta = dto.totalVenta;
    if (dto.insumos !== undefined) patch.insumos = dto.insumos;
    if (dto.servicios !== undefined) patch.servicios = dto.servicios;
    if (dto.manoDeObra !== undefined) patch.mano_de_obra = dto.manoDeObra;
    if (dto.utilidad !== undefined) patch.utilidad = dto.utilidad;
    if (dto.comision !== undefined) patch.comision = dto.comision;
    if (dto.notas !== undefined) patch.notas = dto.notas;
    const { data, error } = await this.db
      .from("finanzas_registros")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toRegistro(data);
  }

  async deleteRegistro(id: string): Promise<void> {
    const { error } = await this.db
      .from("finanzas_registros")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ── Movimientos ─────────────────────────────────────────────────────────────

  async getMovimientos(
    desde?: string,
    hasta?: string,
    cuenta?: CuentaMovimiento,
  ): Promise<FinanzasMovimiento[]> {
    let q = this.db
      .from("finanzas_movimientos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });
    if (desde) q = q.gte("fecha", desde);
    if (hasta) q = q.lte("fecha", hasta);
    if (cuenta) q = q.eq("cuenta", cuenta);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toMovimiento);
  }

  async createMovimiento(
    dto: CreateMovimientoDTO,
  ): Promise<FinanzasMovimiento> {
    const { data, error } = await this.db
      .from("finanzas_movimientos")
      .insert({
        fecha: dto.fecha ?? new Date().toISOString().slice(0, 10),
        tipo: dto.tipo,
        cuenta: dto.cuenta,
        concepto: dto.concepto,
        monto: dto.monto,
        notas: dto.notas ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toMovimiento(data);
  }

  async deleteMovimiento(id: string): Promise<void> {
    const { error } = await this.db
      .from("finanzas_movimientos")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ── Compras ─────────────────────────────────────────────────────────────────

  async getCompras(desde?: string, hasta?: string): Promise<FinanzasCompra[]> {
    let q = this.db
      .from("finanzas_compras")
      .select("*")
      .order("fecha", { ascending: false });
    if (desde) q = q.gte("fecha", desde);
    if (hasta) q = q.lte("fecha", hasta);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toCompra);
  }

  async createCompra(dto: CreateCompraDTO): Promise<FinanzasCompra> {
    const { data, error } = await this.db
      .from("finanzas_compras")
      .insert({
        fecha: dto.fecha ?? new Date().toISOString().slice(0, 10),
        concepto: dto.concepto,
        proveedor: dto.proveedor ?? null,
        categoria: dto.categoria ?? null,
        monto: dto.monto,
        notas: dto.notas ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCompra(data);
  }

  async updateCompra(
    id: string,
    dto: UpdateCompraDTO,
  ): Promise<FinanzasCompra> {
    const patch: any = {};
    if (dto.fecha !== undefined) patch.fecha = dto.fecha;
    if (dto.concepto !== undefined) patch.concepto = dto.concepto;
    if (dto.proveedor !== undefined) patch.proveedor = dto.proveedor;
    if (dto.categoria !== undefined) patch.categoria = dto.categoria;
    if (dto.monto !== undefined) patch.monto = dto.monto;
    if (dto.notas !== undefined) patch.notas = dto.notas;
    const { data, error } = await this.db
      .from("finanzas_compras")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCompra(data);
  }

  async deleteCompra(id: string): Promise<void> {
    const { error } = await this.db
      .from("finanzas_compras")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ── Resumen ─────────────────────────────────────────────────────────────────

  async getResumen(
    desde: string,
    hasta: string,
    filtros: FinanzasFiltros = FILTROS_VACIOS,
  ): Promise<ResumenFinanciero> {
    const [registros, movimientos, compras] = await Promise.all([
      this.getRegistrosFiltrados(desde, hasta, filtros),
      this.getMovimientos(desde, hasta),
      this.getCompras(desde, hasta),
    ]);

    // Acumulados de ventas
    const totales = registros.reduce(
      (acc, r) => ({
        totalVentas: acc.totalVentas + r.totalVenta,
        insumos: acc.insumos + r.insumos,
        servicios: acc.servicios + r.servicios,
        manoDeObra: acc.manoDeObra + r.manoDeObra,
        utilidad: acc.utilidad + r.utilidad,
        comision: acc.comision + (r.comision ?? 0),
      }),
      {
        totalVentas: 0,
        insumos: 0,
        servicios: 0,
        manoDeObra: 0,
        utilidad: 0,
        comision: 0,
      },
    );

    // Movimientos netos por cuenta (ingresos - egresos)
    const movNetos: Record<string, number> = {};
    for (const m of movimientos) {
      const delta = m.tipo === "ingreso" ? m.monto : -m.monto;
      movNetos[m.cuenta] = (movNetos[m.cuenta] ?? 0) + delta;
    }

    const totalCompras = compras.reduce((s, c) => s + c.monto, 0);

    const cuentas: SaldoCuenta[] = [
      {
        nombre: "Utilidad",
        clave: "utilidad" as const,
        acumulado: totales.utilidad,
        movimientosNetos: movNetos["utilidad"] ?? 0,
        saldo: 0,
      },
      {
        nombre: "Mano de obra",
        clave: "mano_de_obra" as const,
        acumulado: totales.manoDeObra,
        movimientosNetos: movNetos["mano_de_obra"] ?? 0,
        saldo: 0,
      },
      {
        nombre: "Servicios",
        clave: "servicios" as const,
        acumulado: totales.servicios,
        movimientosNetos: movNetos["servicios"] ?? 0,
        saldo: 0,
      },
      {
        nombre: "Comisión",
        clave: "comision" as const,
        acumulado: totales.comision,
        movimientosNetos: movNetos["comision"] ?? 0,
        saldo: 0,
      },
      {
        nombre: "Insumos",
        clave: "insumos" as const,
        acumulado: totales.insumos,
        movimientosNetos: 0,
        saldo: 0,
      },
    ].map((c) => ({ ...c, saldo: c.acumulado + c.movimientosNetos }));

    return {
      periodo: { desde, hasta },
      cuentas,
      totalVentas: totales.totalVentas,
      numVentas: registros.length,
      totalCompras,
      saldoNeto: cuentas.find((c) => c.clave === "utilidad")?.saldo ?? 0,
    };
  }
}
