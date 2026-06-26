// src/app/api/admin/ingredientes/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { IngredienteRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import {
  GetIngredienteByIdUseCase,
  UpdateIngredienteUseCase,
  DeleteIngredienteUseCase,
} from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const item = await new GetIngredienteByIdUseCase(
      new IngredienteRepositoryImpl(),
    ).execute(id);
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await new UpdateIngredienteUseCase(
      new IngredienteRepositoryImpl(),
    ).execute(id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    await new DeleteIngredienteUseCase(new IngredienteRepositoryImpl()).execute(
      id,
    );
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}
