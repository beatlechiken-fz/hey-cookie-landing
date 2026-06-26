// src/app/api/admin/ingredientes/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { IngredienteRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import {
  GetIngredientesUseCase,
  CreateIngredienteUseCase,
} from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";
import type { CategoriaIngrediente } from "@/modules/admin/raws/domain/entities/Ingrediente.entity";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetIngredientesUseCase(
      new IngredienteRepositoryImpl(),
    ).execute({
      search: searchParams.get("search") ?? undefined,
      unidadBase: searchParams.get("unidadBase") ?? undefined,
      categoria: (searchParams.get("categoria") ?? undefined) as
        | CategoriaIngrediente
        | undefined,
      activo: searchParams.get("activo") !== "false",
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const created = await new CreateIngredienteUseCase(
      new IngredienteRepositoryImpl(),
    ).execute(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
