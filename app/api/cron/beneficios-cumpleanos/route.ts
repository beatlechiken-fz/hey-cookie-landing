// GET /api/cron/beneficios-cumpleanos — disparado diariamente por Vercel Cron
// (ver vercel.json). Protegido con CRON_SECRET: Vercel firma la petición con
// `Authorization: Bearer ${CRON_SECRET}` automáticamente.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GenerarCumpleanosBeneficioUseCase } from "@/modules/admin/store/domain/usecases/GenerarCumpleanosBeneficio.usecase";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resultado = await new GenerarCumpleanosBeneficioUseCase().execute();
    return NextResponse.json(resultado);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
