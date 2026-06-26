// src/app/api/admin/ordenes/route.ts — UPDATED: agrega search

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import {
  GetOrdenesUseCase,
  CreateOrdenUseCase,
} from "@/modules/admin/store/domain/usecases/Orden.usecase";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const sp = req.nextUrl.searchParams;
    const result = await new GetOrdenesUseCase(
      new OrdenRepositoryImpl(),
    ).execute({
      status: (sp.get("status") as OrdenStatus) ?? undefined,
      clienteId: sp.get("clienteId") ?? undefined,
      search: sp.get("search") ?? undefined,
      page: Number(sp.get("page") ?? 1),
      pageSize: Number(sp.get("pageSize") ?? 50),
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
    const created = await new CreateOrdenUseCase(
      new OrdenRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
