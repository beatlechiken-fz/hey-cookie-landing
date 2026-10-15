// POST /api/admin/clientes/enlaces-edicion — enlaces de actualización para todos los
// clientes activos (reutiliza los vigentes, crea los que falten).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { ClienteRepositoryImpl } from "@/modules/admin/store/data/repositories/Cliente.repository.impl";
import { ClienteEnlaceEdicionRepositoryImpl } from "@/modules/admin/store/data/repositories/ClienteEnlaceEdicion.repository.impl";
import { GenerarEnlacesMasivosUseCase } from "@/modules/admin/store/domain/usecases/ClienteEnlaceEdicion.usecase";

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const enlaces = await new GenerarEnlacesMasivosUseCase(
      new ClienteEnlaceEdicionRepositoryImpl(),
      new ClienteRepositoryImpl(),
    ).execute(req.nextUrl.origin);
    return NextResponse.json(enlaces);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
