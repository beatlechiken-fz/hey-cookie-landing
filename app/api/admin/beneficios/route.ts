// GET /api/admin/beneficios — lista los beneficios automáticos configurados.

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { BeneficioSupabaseDatasource } from "@/modules/admin/store/data/datasources/Beneficio.datasource";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const beneficios = await new BeneficioSupabaseDatasource().findAll();
    return NextResponse.json(beneficios);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
