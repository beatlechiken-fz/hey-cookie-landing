// PATCH /api/admin/beneficios/[tipo] — activa/desactiva un beneficio o ajusta su config.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { BeneficioSupabaseDatasource } from "@/modules/admin/store/data/datasources/Beneficio.datasource";

type Ctx = { params: Promise<{ tipo: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { tipo } = await params;
    const body = await req.json();
    const updated = await new BeneficioSupabaseDatasource().updateByTipo(tipo, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}
