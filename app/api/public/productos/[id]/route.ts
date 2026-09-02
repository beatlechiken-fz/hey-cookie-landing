// GET /api/public/productos/[id] — un producto del catálogo por id, sin auth.
// Necesario para reabrir ProductoModal/CookieModal al editar un item del
// carrito desde una página distinta a la que originalmente lo cargó (el
// carrito es un store global, pero el objeto Producto completo no viaja con
// el item — solo su productoId).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ProductoRepositoryImpl } from "@/modules/admin/store/data/repositories/Producto.repository.impl";
import { GetProductoByIdUseCase } from "@/modules/admin/store/domain/usecases/Producto.usecase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const item = await new GetProductoByIdUseCase(
      new ProductoRepositoryImpl(),
    ).execute(id);
    if (!item.activo) {
      return NextResponse.json({ error: "Producto no disponible" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message?.includes("no encontrado") ? 404 : 500 },
    );
  }
}
