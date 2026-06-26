// src/app/api/admin/cupones/disponibles-para-cliente/route.ts
// GET ?clienteId=...&search=... — cupones individuales activos NO asignados aún a este cliente

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { CuponRepositoryImpl } from "@/modules/admin/store/data/repositories/Cupon.repository.impl";
import { GetCuponesDisponiblesParaClienteUseCase } from "@/modules/admin/store/domain/usecases/Cupon.usecase";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const clienteId = searchParams.get("clienteId");
    if (!clienteId)
      return NextResponse.json(
        { error: "clienteId es requerido" },
        { status: 400 },
      );

    const search = searchParams.get("search") ?? undefined;
    const result = await new GetCuponesDisponiblesParaClienteUseCase(
      new CuponRepositoryImpl(),
    ).execute(clienteId, search);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
