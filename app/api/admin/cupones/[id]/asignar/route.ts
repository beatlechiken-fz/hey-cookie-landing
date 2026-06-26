// src/app/api/admin/cupones/[id]/asignar/route.ts
// POST { clienteId } — asigna un cupón individual a un cliente (relación m2m)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { CuponRepositoryImpl } from "@/modules/admin/store/data/repositories/Cupon.repository.impl";
import { AsignarCuponClienteUseCase } from "@/modules/admin/store/domain/usecases/Cupon.usecase";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const { clienteId } = await req.json();
    if (!clienteId)
      return NextResponse.json(
        { error: "clienteId es requerido" },
        { status: 400 },
      );

    await new AsignarCuponClienteUseCase(new CuponRepositoryImpl()).execute(
      id,
      clienteId,
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 400 },
    );
  }
}
