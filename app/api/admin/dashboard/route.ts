import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

export interface DashboardKPI {
  ventasMes: number;
  ventasMesAnterior: number;
  utilidadMes: number;
  utilidadMesAnterior: number;
  comprasMes: number;
  totalClientes: number;
  totalProductos: number;
  ordenesActivas: number;
  ticketPromedio: number;
}

export interface InventarioResumen {
  totalSkus: number;
  skusBajoStock: number;
  itemsBajoStock: { productoId: string; nombre: string; stock: number }[];
}

export interface IngresosVsGastos {
  ingresos: number;
  gastos: number;
  margenPct: number | null;
}

export interface TopProducto {
  productoNombre: string;
  cantidad: number;
  ingreso: number;
}

export interface OrdenResumenItem {
  id: string;
  numero: number;
  clienteNombre: string | null;
  status: string;
  total: number;
  fechaEntrega: string | null;
  createdAt: string;
}

export interface DashboardData {
  kpi: DashboardKPI;
  ordenesPorEstado: { status: string; count: number; total: number }[];
  ordenesRecientes: OrdenResumenItem[];
  ventasPorDia: { fecha: string; ventas: number; utilidad: number }[];
  desgloseFinanciero: {
    insumos: number;
    manoDeObra: number;
    servicios: number;
    utilidad: number;
    comision: number;
  };
  inventario: InventarioResumen;
  ingresosVsGastos: IngresosVsGastos;
  topProductos: TopProducto[];
}

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = getSupabaseAdmin();
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const hoy = now.toISOString().slice(0, 10);
    const iniMes = `${y}-${String(m).padStart(2, "0")}-01`;

    // Mes anterior
    const prevD = new Date(y, m - 2, 1);
    const py = prevD.getFullYear();
    const pm = prevD.getMonth() + 1;
    const iniPrev = `${py}-${String(pm).padStart(2, "0")}-01`;
    const finPrev = new Date(y, m - 1, 0).toISOString().slice(0, 10);

    // Ventana de 30 días para la gráfica
    const hace30 = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [
      { data: regMes },
      { data: regPrev },
      { data: comprasMes },
      { data: ordenes },
      { count: totalClientes },
      { count: totalProductos },
      { data: regChart },
      { data: produccionesRows },
      { data: ordenesMes },
    ] = await Promise.all([
      db.from("finanzas_registros")
        .select("total_venta, utilidad, insumos, mano_de_obra, servicios, comision")
        .gte("fecha_venta", iniMes)
        .lte("fecha_venta", hoy),
      db.from("finanzas_registros")
        .select("total_venta, utilidad")
        .gte("fecha_venta", iniPrev)
        .lte("fecha_venta", finPrev),
      db.from("finanzas_compras")
        .select("monto")
        .gte("fecha", iniMes)
        .lte("fecha", hoy),
      db.from("ordenes")
        .select("id, numero, cliente_nombre, status, total, fecha_entrega, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      db.from("clientes").select("*", { count: "exact", head: true }),
      db.from("productos")
        .select("*", { count: "exact", head: true })
        .eq("activo", true),
      db.from("finanzas_registros")
        .select("fecha_venta, total_venta, utilidad")
        .gte("fecha_venta", hace30)
        .lte("fecha_venta", hoy)
        .order("fecha_venta", { ascending: true }),
      // Inventario: solo productos que alguna vez registraron producción.
      db.from("producciones").select("producto_id"),
      // Órdenes del mes (no canceladas) para costo de producción y top productos.
      db.from("ordenes")
        .select("id, status")
        .gte("created_at", iniMes)
        .lte("created_at", `${hoy}T23:59:59`)
        .neq("status", "cancelado"),
    ]);

    // ── KPIs ────────────────────────────────────────────────────────
    const sum = (arr: any[], key: string) =>
      (arr ?? []).reduce((s: number, r: any) => s + Number(r[key] ?? 0), 0);

    const ventasMes = sum(regMes ?? [], "total_venta");
    const utilidadMes = sum(regMes ?? [], "utilidad");
    const ventasMesAnterior = sum(regPrev ?? [], "total_venta");
    const utilidadMesAnterior = sum(regPrev ?? [], "utilidad");
    const comprasMesTot = sum(comprasMes ?? [], "monto");

    // ── Órdenes por estado ───────────────────────────────────────────
    const ACTIVE = new Set(["cotizacion", "en_proceso", "listo_entregar", "pagado"]);
    const statusMap: Record<string, { count: number; total: number }> = {};
    let ordenesActivas = 0;

    for (const o of ordenes ?? []) {
      if (!statusMap[o.status]) statusMap[o.status] = { count: 0, total: 0 };
      statusMap[o.status].count++;
      statusMap[o.status].total += Number(o.total);
      if (ACTIVE.has(o.status)) ordenesActivas++;
    }

    const STATUS_ORDER = ["cotizacion", "en_proceso", "listo_entregar", "pagado", "entregado", "cancelado"];
    const ordenesPorEstado = STATUS_ORDER
      .filter((s) => statusMap[s])
      .map((s) => ({ status: s, ...statusMap[s] }));

    // ── Órdenes recientes ────────────────────────────────────────────
    const ordenesRecientes: OrdenResumenItem[] = (ordenes ?? []).slice(0, 8).map((o: any) => ({
      id: o.id,
      numero: o.numero,
      clienteNombre: o.cliente_nombre ?? null,
      status: o.status,
      total: Number(o.total),
      fechaEntrega: o.fecha_entrega ?? null,
      createdAt: o.created_at,
    }));

    // ── Gráfica diaria (30 días, rellenar días sin ventas con 0) ────
    const diaMap: Record<string, { ventas: number; utilidad: number }> = {};
    for (const r of regChart ?? []) {
      const f: string = r.fecha_venta;
      if (!diaMap[f]) diaMap[f] = { ventas: 0, utilidad: 0 };
      diaMap[f].ventas += Number(r.total_venta);
      diaMap[f].utilidad += Number(r.utilidad);
    }

    const ventasPorDia = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const f = d.toISOString().slice(0, 10);
      return { fecha: f, ...(diaMap[f] ?? { ventas: 0, utilidad: 0 }) };
    });

    // ── Desglose financiero mes actual ───────────────────────────────
    const desgloseFinanciero = (regMes ?? []).reduce(
      (acc: any, r: any) => ({
        insumos:    acc.insumos    + Number(r.insumos    ?? 0),
        manoDeObra: acc.manoDeObra + Number(r.mano_de_obra ?? 0),
        servicios:  acc.servicios  + Number(r.servicios  ?? 0),
        utilidad:   acc.utilidad   + Number(r.utilidad   ?? 0),
        comision:   acc.comision   + Number(r.comision   ?? 0),
      }),
      { insumos: 0, manoDeObra: 0, servicios: 0, utilidad: 0, comision: 0 },
    );

    // ── Inventario: solo SKUs que alguna vez se produjeron ────────────
    const productoIdsConProduccion = Array.from(
      new Set((produccionesRows ?? []).map((r: any) => r.producto_id)),
    );
    let inventario: InventarioResumen = { totalSkus: 0, skusBajoStock: 0, itemsBajoStock: [] };
    if (productoIdsConProduccion.length > 0) {
      const { data: prods } = await db
        .from("productos")
        .select("id, nombre, stock_actual")
        .in("id", productoIdsConProduccion);
      const STOCK_BAJO = 5;
      const items = (prods ?? []).map((p: any) => ({
        productoId: p.id,
        nombre: p.nombre,
        stock: Number(p.stock_actual ?? 0),
      }));
      inventario = {
        totalSkus: items.length,
        skusBajoStock: items.filter((i) => i.stock <= STOCK_BAJO).length,
        itemsBajoStock: items
          .filter((i) => i.stock <= STOCK_BAJO)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 6),
      };
    }

    // ── Costo de producción del mes + top productos (de orden_items) ──
    const ordenIdsMes = (ordenesMes ?? []).map((o: any) => o.id);
    let costoProduccionMes = 0;
    const topMap = new Map<string, TopProducto>();
    if (ordenIdsMes.length > 0) {
      const { data: itemsMes } = await db
        .from("orden_items")
        .select("nombre, cantidad, costo_unitario, precio_unitario")
        .in("orden_id", ordenIdsMes);
      for (const it of itemsMes ?? []) {
        const cant = Number(it.cantidad);
        costoProduccionMes += Number(it.costo_unitario) * cant;
        const ingreso = Number(it.precio_unitario) * cant;
        const existing = topMap.get(it.nombre);
        if (existing) {
          existing.cantidad += cant;
          existing.ingreso += ingreso;
        } else {
          topMap.set(it.nombre, { productoNombre: it.nombre, cantidad: cant, ingreso });
        }
      }
    }
    const topProductos = Array.from(topMap.values())
      .sort((a, b) => b.ingreso - a.ingreso)
      .slice(0, 5);

    const gastosMes = comprasMesTot + costoProduccionMes;
    const ingresosVsGastos: IngresosVsGastos = {
      ingresos: ventasMes,
      gastos: gastosMes,
      margenPct: ventasMes > 0 ? ((ventasMes - gastosMes) / ventasMes) * 100 : null,
    };

    const totalOrdenesMes = (regMes ?? []).length;
    const ticketPromedio = totalOrdenesMes > 0 ? ventasMes / totalOrdenesMes : 0;

    const data: DashboardData = {
      kpi: {
        ventasMes, ventasMesAnterior,
        utilidadMes, utilidadMesAnterior,
        comprasMes: comprasMesTot,
        totalClientes: totalClientes ?? 0,
        totalProductos: totalProductos ?? 0,
        ordenesActivas,
        ticketPromedio,
      },
      ordenesPorEstado,
      ordenesRecientes,
      ventasPorDia,
      desgloseFinanciero,
      inventario,
      ingresosVsGastos,
      topProductos,
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
