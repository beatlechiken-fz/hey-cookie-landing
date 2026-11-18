// src/app/api/admin/ordenes/pruebas/route.ts
//
// POST — crea una prueba interna (orden con status "test"). No toca
// inventario, cashback, cupones ni finanzas: solo existe y tiene comanda.
// El listado sale de GET /api/admin/ordenes?statuses=test.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import { CreatePruebaUseCase } from "@/modules/admin/store/domain/usecases/Orden.usecase";

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const created = await new CreatePruebaUseCase(new OrdenRepositoryImpl()).execute({
      items: body.items,
      notas: body.notas ?? null,
      fechaRealizacion: body.fechaRealizacion,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al crear la prueba";
    const esValidacion = !msg.startsWith("create prueba");
    return NextResponse.json({ error: msg }, { status: esValidacion ? 400 : 500 });
  }
}
