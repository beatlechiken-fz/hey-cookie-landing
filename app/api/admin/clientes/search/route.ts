// src/app/api/admin/clientes/search/route.ts
// GET ?q=... — búsqueda ligera de clientes para selectores (carrito, cupones, etc.)
// Devuelve ClienteResumen[], máximo 10 resultados

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { ClienteRepositoryImpl } from "@/modules/admin/store/data/repositories/Cliente.repository.impl";
import { GetClientesUseCase } from "@/modules/admin/store/domain/usecases/Cliente.usecase";
import type { ClienteResumen } from "@/modules/admin/store/domain/entities/Cliente.entity";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") ?? "";

    const result = await new GetClientesUseCase(
      new ClienteRepositoryImpl(),
    ).execute({
      search: q || undefined,
      activo: true,
      page: 1,
      pageSize: 10,
    });

    const resumen: ClienteResumen[] = result.data.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      telefono: c.telefono,
      email: c.email,
    }));

    return NextResponse.json(resumen);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
