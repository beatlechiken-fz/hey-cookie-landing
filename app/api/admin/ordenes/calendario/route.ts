// src/app/api/admin/ordenes/calendario/route.ts
//
// Entregas para el calendario del dashboard: órdenes con fecha de entrega en
// el rango pedido, sin canceladas. Se consulta por mes visible.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

export interface EntregaCalendario {
  id: string;
  numero: number;
  clienteNombre: string | null;
  status: string;
  fechaEntrega: string;
  total: number;
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const sp = req.nextUrl.searchParams;
    const desde = sp.get("desde") ?? "";
    const hasta = sp.get("hasta") ?? "";
    if (!FECHA.test(desde) || !FECHA.test(hasta))
      return NextResponse.json(
        { error: "desde y hasta deben ser fechas YYYY-MM-DD" },
        { status: 400 },
      );

    const { data, error } = await getSupabaseAdmin()
      .from("ordenes")
      .select("id, numero, status, total, fecha_entrega, clientes(nombre)")
      .gte("fecha_entrega", desde)
      .lte("fecha_entrega", `${hasta}T23:59:59`)
      .neq("status", "cancelado")
      .order("fecha_entrega", { ascending: true })
      .order("numero", { ascending: true });
    if (error) throw new Error(error.message);

    const out: EntregaCalendario[] = (data ?? []).map((o: any) => ({
      id: o.id,
      numero: Number(o.numero),
      clienteNombre: o.clientes?.nombre ?? null,
      status: o.status,
      fechaEntrega: o.fecha_entrega,
      total: Number(o.total),
    }));
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
