// POST /api/admin/beneficios/cumpleanos/generar — disparo manual desde el admin
// (respaldo del cron diario).

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { GenerarCumpleanosBeneficioUseCase } from "@/modules/admin/store/domain/usecases/GenerarCumpleanosBeneficio.usecase";

export async function POST() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const resultado = await new GenerarCumpleanosBeneficioUseCase().execute();
    return NextResponse.json(resultado);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
