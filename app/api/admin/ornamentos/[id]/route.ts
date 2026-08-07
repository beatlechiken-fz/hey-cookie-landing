// GET    /api/admin/ornamentos/[id]
// PATCH  /api/admin/ornamentos/[id]
// DELETE /api/admin/ornamentos/[id]

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrnamentoRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ornamento.repository.impl";
import {
  GetOrnamentoByIdUseCase,
  UpdateOrnamentoUseCase,
  DeleteOrnamentoUseCase,
} from "@/modules/admin/raws/domain/usecases/Ornamento.usecase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const item = await new GetOrnamentoByIdUseCase(
      new OrnamentoRepositoryImpl(),
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
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const updated = await new UpdateOrnamentoUseCase(
      new OrnamentoRepositoryImpl(),
    ).execute(id, await req.json());
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    await new DeleteOrnamentoUseCase(new OrnamentoRepositoryImpl()).execute(id);
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}
