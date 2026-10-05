// src/app/api/admin/ordenes/[id]/items/[itemId]/observaciones/route.ts
//
// Editar solo las observaciones de una partida. Mismo criterio de estado que
// editar/quitar partidas (cotización o en_proceso).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import { UpdateOrdenItemObservacionesUseCase } from "@/modules/admin/store/domain/usecases/Orden.usecase";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

function errorStatus(message: string): number {
  if (message.includes("no encontrada") || message.includes("no tiene un producto"))
    return 404;
  if (message.includes("ya no se puede editar")) return 409;
  if (message.includes("no pueden pasar")) return 400;
  return 500;
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id, itemId } = await params;
    const body = await req.json();
    if (body.observaciones != null && typeof body.observaciones !== "string")
      return NextResponse.json({ error: "observaciones debe ser texto" }, { status: 400 });
    const updated = await new UpdateOrdenItemObservacionesUseCase(
      new OrdenRepositoryImpl(),
    ).execute(id, itemId, body.observaciones ?? null);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: errorStatus(e.message) });
  }
}
