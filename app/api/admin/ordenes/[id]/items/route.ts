// src/app/api/admin/ordenes/[id]/items/route.ts
//
// Agregar una partida (orden_item) nueva a una orden ya generada.
// Solo permitido mientras la orden está en cotización o en_proceso — ver
// ORDEN_STATUS_EDITABLES / assertEditable en el usecase.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import { AddOrdenItemUseCase } from "@/modules/admin/store/domain/usecases/Orden.usecase";

type Ctx = { params: Promise<{ id: string }> };

function errorStatus(message: string): number {
  if (message.includes("no encontrada")) return 404;
  if (message.includes("ya no se puede editar")) return 409;
  return 500;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await new AddOrdenItemUseCase(new OrdenRepositoryImpl()).execute(id, {
      nombre: body.nombre,
      configuracion: body.configuracion,
      cantidad: body.cantidad,
      costoUnitario: body.costoUnitario,
      precioUnitario: body.precioUnitario,
      desgloseCostos: body.desgloseCostos ?? null,
    });
    return NextResponse.json(updated, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: errorStatus(e.message) });
  }
}
