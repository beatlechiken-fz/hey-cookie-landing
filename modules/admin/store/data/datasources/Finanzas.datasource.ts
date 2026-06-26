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

  async getResumen(desde: string, hasta: string): Promise<ResumenFinanciero> {
    const [registros, movimientos, compras] = await Promise.all([
      this.getRegistros(desde, hasta),
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
      totalCompras,
      saldoNeto: cuentas.find((c) => c.clave === "utilidad")?.saldo ?? 0,
    };
  }
}
