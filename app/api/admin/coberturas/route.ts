// src/app/api/admin/coberturas/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { CoberturaRepositoryImpl } from "@/modules/admin/raws/data/repositories/Cobertura.repository.impl";
import {
  GetCoberturasUseCase,
  CreateCoberturaUseCase,
} from "@/modules/admin/raws/domain/usecases/Cobertura.usecase";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetCoberturasUseCase(
      new CoberturaRepositoryImpl(),
    ).execute({
      search: searchParams.get("search") ?? undefined,
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
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const created = await new CreateCoberturaUseCase(
      new CoberturaRepositoryImpl(),
    ).execute(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
