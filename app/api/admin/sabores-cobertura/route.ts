// src/app/api/admin/sabores-cobertura/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { SaborRepositoryImpl } from "@/modules/admin/raws/data/repositories/Cobertura.repository.impl";
import {
  GetSaboresUseCase,
  CreateSaborUseCase,
} from "@/modules/admin/raws/domain/usecases/Cobertura.usecase";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetSaboresUseCase(
      new SaborRepositoryImpl(),
    ).execute({
      search: searchParams.get("search") ?? undefined,
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
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const created = await new CreateSaborUseCase(
      new SaborRepositoryImpl(),
    ).execute(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
