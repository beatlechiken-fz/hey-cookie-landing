// src/app/api/admin/inventario/stock/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { InventarioRepositoryImpl } from "@/modules/admin/store/data/repositories/Inventario.repository.impl";
import { ListStockUseCase } from "@/modules/admin/store/domain/usecases/Inventario.usecase";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const sp = req.nextUrl.searchParams;
    const result = await new ListStockUseCase(
      new InventarioRepositoryImpl(),
    ).execute({
      search: sp.get("search") ?? undefined,
      page: Number(sp.get("page") ?? 1),
      pageSize: Number(sp.get("pageSize") ?? 50),
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
