// GET — Lista gelatinas desde gelatina_ingredientes (tabla unificada)
// POST — Crea una nueva gelatina

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { GelatinaCatalogo } from "@/modules/admin/store/domain/entities/GelatinaCotizador.entity";
import { GelatinaRepositoryImpl } from "@/modules/admin/raws/data/repositories/Gelatina.repository.impl";
import {
  GetGelatinasUseCase,
  CreateGelatinaUseCase,
} from "@/modules/admin/raws/domain/usecases/Gelatina.usecase";

async function getCatalogFromUnifiedTable(): Promise<GelatinaCatalogo[]> {
  const { data: rows, error } = await getSupabaseAdmin()
    .from("gelatina_ingredientes")
    .select("gelatina_id, nombre, activo, cantidad, ingredientes(costo_unidad_minima)")
    .eq("activo", true)
    .order("nombre");
  if (error) throw new Error(error.message);

  const map = new Map<string, { nombre: string; costoTotal: number }>();
  for (const r of rows ?? []) {
    if (!map.has(r.gelatina_id)) map.set(r.gelatina_id, { nombre: r.nombre, costoTotal: 0 });
    const g = map.get(r.gelatina_id)!;
    g.costoTotal += Number(r.cantidad) * Number((r as any).ingredientes?.costo_unidad_minima ?? 0);
  }

  return Array.from(map.entries()).map(([id, g]) => ({
    id,
    nombre: g.nombre,
    costoTotal: g.costoTotal,
    activo: true,
  }));
}

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;

    if (searchParams.get("crud") === "true") {
      const result = await new GetGelatinasUseCase(
        new GelatinaRepositoryImpl(),
      ).execute({
        search: searchParams.get("search") ?? undefined,
        page: Number(searchParams.get("page") ?? 1),
        pageSize: Number(searchParams.get("pageSize") ?? 20),
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(await getCatalogFromUnifiedTable());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const created = await new CreateGelatinaUseCase(
      new GelatinaRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
