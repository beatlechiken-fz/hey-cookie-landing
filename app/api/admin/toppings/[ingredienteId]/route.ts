// src/app/api/admin/toppings/[ingredienteId]/route.ts
// PUT  { cantidad, unidad, notas } — crea/actualiza la cantidad de un topping
// DELETE — quita el flag topping y elimina su cantidad

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { ToppingRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import {
  UpsertToppingCantidadUseCase,
  RemoveToppingUseCase,
} from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";

type Ctx = { params: Promise<{ ingredienteId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { ingredienteId } = await params;
    const body = await req.json();
    const result = await new UpsertToppingCantidadUseCase(
      new ToppingRepositoryImpl(),
    ).execute({
      ingredienteId,
      cantidad: body.cantidad ?? null,
      unidad: body.unidad ?? null,
      notas: body.notas ?? null,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { ingredienteId } = await params;
    await new RemoveToppingUseCase(new ToppingRepositoryImpl()).execute(
      ingredienteId,
    );
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
