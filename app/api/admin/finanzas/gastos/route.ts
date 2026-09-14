// src/app/api/admin/finanzas/gastos/route.ts
//
// Vista de gastos con filtros: compras (a proveedores, por categoría) +
// costo de insumos por producto/línea (derivado de orden_items en el
// período, excluyendo órdenes canceladas) — para responder "¿cuánto gasté
// en X producto/categoría?" desde un solo lugar.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { CategoriaCompra } from "@/modules/admin/store/domain/entities/Finanzas.entity";

export interface CostoPorProducto {
  productoId: string;
  productoNombre: string;
  cantidadVendida: number;
  costoTotal: number;
}

export interface CostoPorLinea {
  linea: string;
  costoTotal: number;
}

export interface GastosData {
  compras: {
    id: string;
    fecha: string;
    concepto: string;
    proveedor: string | null;
    categoria: CategoriaCompra | null;
    monto: number;
  }[];
  totalCompras: number;
  porCategoriaCompra: { categoria: string; total: number }[];
  costoPorProducto: CostoPorProducto[];
  costoPorLinea: CostoPorLinea[];
  totalCostoProduccion: number;
}

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const sp = req.nextUrl.searchParams;
    const desde = sp.get("desde") ?? new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const hasta = sp.get("hasta") ?? new Date().toISOString().slice(0, 10);
    const categoriaFiltro = sp.get("categoria") ?? undefined;
    const proveedorFiltro = sp.get("proveedor")?.trim().toLowerCase() ?? undefined;
    const productoIdFiltro = sp.get("productoId") ?? undefined;
    const lineaFiltro = sp.get("linea") ?? undefined;

    const db = getSupabaseAdmin();

    // ── Compras (proveedores) ─────────────────────────────────────────────
    let comprasQ = db
      .from("finanzas_compras")
      .select("id, fecha, concepto, proveedor, categoria, monto")
      .gte("fecha", desde)
      .lte("fecha", hasta);
    if (categoriaFiltro) comprasQ = comprasQ.eq("categoria", categoriaFiltro);
    const { data: comprasRaw, error: ce } = await comprasQ.order("fecha", { ascending: false });
    if (ce) throw new Error(ce.message);

    const compras = (comprasRaw ?? []).filter(
      (c: any) =>
        !proveedorFiltro || (c.proveedor ?? "").toLowerCase().includes(proveedorFiltro),
    );
    const totalCompras = compras.reduce((s: number, c: any) => s + Number(c.monto), 0);

    const catMap: Record<string, number> = {};
    for (const c of compras) {
      const k = c.categoria ?? "otros";
      catMap[k] = (catMap[k] ?? 0) + Number(c.monto);
    }
    const porCategoriaCompra = Object.entries(catMap).map(([categoria, total]) => ({
      categoria,
      total,
    }));

    // ── Costo de producción por producto/línea (de orden_items, sin canceladas) ──
    const { data: ordenesRango, error: oe } = await db
      .from("ordenes")
      .select("id, status, created_at")
      .gte("created_at", desde)
      .lte("created_at", `${hasta}T23:59:59`)
      .neq("status", "cancelado");
    if (oe) throw new Error(oe.message);

    const ordenIds = (ordenesRango ?? []).map((o: any) => o.id);
    let costoPorProducto: CostoPorProducto[] = [];
    let costoPorLinea: CostoPorLinea[] = [];
    let totalCostoProduccion = 0;

    if (ordenIds.length > 0) {
      const { data: items, error: ie } = await db
        .from("orden_items")
        .select("configuracion, cantidad, costo_unitario, nombre")
        .in("orden_id", ordenIds);
      if (ie) throw new Error(ie.message);

      // productoId -> nombre/línea, para agrupar por línea también.
      const { data: productos } = await db
        .from("productos")
        .select("id, nombre, linea");
      const prodMap = new Map((productos ?? []).map((p: any) => [p.id, p]));

      const porProducto = new Map<string, CostoPorProducto>();
      const porLinea = new Map<string, number>();

      for (const item of items ?? []) {
        const productoId = (item.configuracion as any)?.productoId as string | undefined;
        if (!productoId) continue; // pastel/gelatina personalizado — sin producto de catálogo
        if (productoIdFiltro && productoId !== productoIdFiltro) continue;

        const prod = prodMap.get(productoId);
        if (lineaFiltro && prod?.linea !== lineaFiltro) continue;

        const costo = Number(item.costo_unitario) * Number(item.cantidad);
        totalCostoProduccion += costo;

        const existing = porProducto.get(productoId);
        if (existing) {
          existing.cantidadVendida += Number(item.cantidad);
          existing.costoTotal += costo;
        } else {
          porProducto.set(productoId, {
            productoId,
            productoNombre: prod?.nombre ?? item.nombre,
            cantidadVendida: Number(item.cantidad),
            costoTotal: costo,
          });
        }

        const linea = prod?.linea ?? "sin línea";
        porLinea.set(linea, (porLinea.get(linea) ?? 0) + costo);
      }

      costoPorProducto = Array.from(porProducto.values()).sort(
        (a, b) => b.costoTotal - a.costoTotal,
      );
      costoPorLinea = Array.from(porLinea.entries())
        .map(([linea, costoTotal]) => ({ linea, costoTotal }))
        .sort((a, b) => b.costoTotal - a.costoTotal);
    }

    const data: GastosData = {
      compras: compras.map((c: any) => ({
        id: c.id,
        fecha: c.fecha,
        concepto: c.concepto,
        proveedor: c.proveedor ?? null,
        categoria: c.categoria ?? null,
        monto: Number(c.monto),
      })),
      totalCompras,
      porCategoriaCompra,
      costoPorProducto,
      costoPorLinea,
      totalCostoProduccion,
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
