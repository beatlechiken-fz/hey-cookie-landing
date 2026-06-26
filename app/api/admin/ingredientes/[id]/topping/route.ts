// src/app/api/admin/ingredientes/[id]/topping/route.ts
// PATCH { value: boolean } — activa o desactiva el flag topping de un ingrediente

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { IngredienteRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import { SetToppingUseCase } from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const { value } = await req.json();
    if (typeof value !== "boolean") {
      return NextResponse.json(
        { error: "El campo 'value' debe ser boolean" },
        { status: 400 },
      );
    }
    const updated = await new SetToppingUseCase(
      new IngredienteRepositoryImpl(),
    ).execute(id, value);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
