// src/app/api/admin/inventario/producciones/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { InventarioRepositoryImpl } from "@/modules/admin/store/data/repositories/Inventario.repository.impl";
import {
  ListProduccionesUseCase,
  RegistrarProduccionUseCase,
} from "@/modules/admin/store/domain/usecases/Inventario.usecase";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const sp = req.nextUrl.searchParams;
    const result = await new ListProduccionesUseCase(
      new InventarioRepositoryImpl(),
    ).execute({
      productoId: sp.get("productoId") ?? undefined,
      page: Number(sp.get("page") ?? 1),
      pageSize: Number(sp.get("pageSize") ?? 30),
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const created = await new RegistrarProduccionUseCase(
      new InventarioRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
