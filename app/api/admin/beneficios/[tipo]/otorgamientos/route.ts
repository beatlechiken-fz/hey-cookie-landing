// GET /api/admin/beneficios/[tipo]/otorgamientos — últimos otorgamientos de un beneficio.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { BeneficioSupabaseDatasource } from "@/modules/admin/store/data/datasources/Beneficio.datasource";

type Ctx = { params: Promise<{ tipo: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { tipo } = await params;
    const ds = new BeneficioSupabaseDatasource();
    const beneficio = await ds.findByTipo(tipo);
    if (!beneficio) return NextResponse.json([]);
    const otorgamientos = await ds.listOtorgamientos(beneficio.id);
    return NextResponse.json(otorgamientos);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
