// src/app/api/admin/ordenes/[id]/items/[itemId]/route.ts
//
// Editar o quitar una partida (orden_item) de una orden ya generada.
// Solo permitido mientras la orden está en cotización o en_proceso — ver
// ORDEN_STATUS_EDITABLES / assertEditable en el usecase.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import {
  UpdateOrdenItemUseCase,
  RemoveOrdenItemUseCase,
} from "@/modules/admin/store/domain/usecases/Orden.usecase";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

function errorStatus(message: string): number {
  if (message.includes("no encontrada") || message.includes("no tiene un producto"))
    return 404;
  if (message.includes("ya no se puede editar") || message.includes("último producto"))
    return 409;
  return 500;
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id, itemId } = await params;
    const body = await req.json();
    const updated = await new UpdateOrdenItemUseCase(
      new OrdenRepositoryImpl(),
    ).execute(id, itemId, {
      nombre: body.nombre,
      configuracion: body.configuracion,
      cantidad: body.cantidad,
      costoUnitario: body.costoUnitario,
      precioUnitario: body.precioUnitario,
      desgloseCostos: body.desgloseCostos ?? null,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: errorStatus(e.message) });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id, itemId } = await params;
    const updated = await new RemoveOrdenItemUseCase(
      new OrdenRepositoryImpl(),
    ).execute(id, itemId);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: errorStatus(e.message) });
  }
}
