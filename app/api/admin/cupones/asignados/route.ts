// src/app/api/admin/cupones/asignados/route.ts
// GET ?clienteId=... — cupones (con status de uso) asignados a este cliente

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { CuponRepositoryImpl } from "@/modules/admin/store/data/repositories/Cupon.repository.impl";
import { GetCuponesAsignadosUseCase } from "@/modules/admin/store/domain/usecases/Cupon.usecase";

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

    const result = await new GetCuponesAsignadosUseCase(
      new CuponRepositoryImpl(),
    ).execute(clienteId);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
