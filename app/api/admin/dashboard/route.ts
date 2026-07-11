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

    const data: DashboardData = {
      kpi: {
        ventasMes, ventasMesAnterior,
        utilidadMes, utilidadMesAnterior,
        comprasMes: comprasMesTot,
        totalClientes: totalClientes ?? 0,
        totalProductos: totalProductos ?? 0,
        ordenesActivas,
      },
      ordenesPorEstado,
      ordenesRecientes,
      ventasPorDia,
      desgloseFinanciero,
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
