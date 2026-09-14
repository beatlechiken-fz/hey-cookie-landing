// src/app/api/admin/inventario/stock/[productoId]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { InventarioRepositoryImpl } from "@/modules/admin/store/data/repositories/Inventario.repository.impl";
import { GetStockByProductoUseCase } from "@/modules/admin/store/domain/usecases/Inventario.usecase";

type Ctx = { params: Promise<{ productoId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { productoId } = await params;
    const result = await new GetStockByProductoUseCase(
      new InventarioRepositoryImpl(),
    ).execute(productoId);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrado") ? 404 : 500 },
    );
  }
}
