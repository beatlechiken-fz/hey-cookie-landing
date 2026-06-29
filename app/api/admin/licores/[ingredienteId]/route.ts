// src/app/api/admin/licores/[ingredienteId]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { LicorRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import { UpsertLicorCantidadUseCase } from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";

type Ctx = { params: Promise<{ ingredienteId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { ingredienteId } = await params;
    const body = await req.json();

    // ingredienteId viene de params (URL) o del body como fallback
    const resolvedId = ingredienteId || body.ingredienteId;

    if (!resolvedId) {
      return NextResponse.json(
        { error: "ingredienteId requerido" },
        { status: 400 },
      );
    }

    const result = await new UpsertLicorCantidadUseCase(
      new LicorRepositoryImpl(),
    ).execute({
      ingredienteId: resolvedId,
      cantidad: body.cantidad ?? null,
      notas: body.notas ?? null,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
