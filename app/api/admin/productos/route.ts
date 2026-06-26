// src/app/api/admin/productos/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { ProductoRepositoryImpl } from "@/modules/admin/store/data/repositories/Producto.repository.impl";
import {
  GetProductosUseCase,
  CreateProductoUseCase,
} from "@/modules/admin/store/domain/usecases/Producto.usecase";
import type { LineaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetProductosUseCase(
      new ProductoRepositoryImpl(),
    ).execute({
      search: searchParams.get("search") ?? undefined,
      linea: (searchParams.get("linea") as LineaProducto) ?? undefined,
      activo: searchParams.get("activo") !== "false",
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 50),
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
    const created = await new CreateProductoUseCase(
      new ProductoRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
