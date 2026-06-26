// src/app/api/admin/gelatinas/route.ts
// GET — Lista todas las gelatinas activas con su costo por litro

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { GelatinaCatalogo } from "@/modules/admin/store/domain/entities/GelatinaCotizador.entity";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("gelatinas")
      .select("*")
      .eq("activo", true)
      .order("nombre");
    if (error) throw new Error(error.message);

    const gelatinas: GelatinaCatalogo[] = (data ?? []).map((g: any) => ({
      id: g.id,
      nombre: g.nombre,
      descripcion: g.descripcion ?? null,
      elaboracion: g.elaboracion ?? null,
      costoTotalLeche: Number(g.costo_total_leche),
      costoTotalAgua: Number(g.costo_total_agua),
      tieneBaseLeche: g.tiene_base_leche,
      tieneBaseAgua: g.tiene_base_agua,
      activo: g.activo,
    }));
    return NextResponse.json(gelatinas);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
