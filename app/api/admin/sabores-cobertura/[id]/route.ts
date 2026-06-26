// src/app/api/admin/sabores/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { SaborRepositoryImpl } from "@/modules/admin/raws/data/repositories/Cobertura.repository.impl";
import {
  GetSaborByIdUseCase,
  UpdateSaborUseCase,
  DeleteSaborUseCase,
} from "@/modules/admin/raws/domain/usecases/Cobertura.usecase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const item = await new GetSaborByIdUseCase(
      new SaborRepositoryImpl(),
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
    const updated = await new UpdateSaborUseCase(
      new SaborRepositoryImpl(),
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
    await new DeleteSaborUseCase(new SaborRepositoryImpl()).execute(id);
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}
