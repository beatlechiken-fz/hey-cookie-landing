// src/app/api/admin/empaques/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { EmpaqueRepositoryImpl } from "@/modules/admin/raws/data/repositories/Empaque.repository.impl";
import {
  GetEmpaquesUseCase,
  CreateEmpaqueUseCase,
} from "@/modules/admin/raws/domain/usecases/Empaque.usecase";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetEmpaquesUseCase(
      new EmpaqueRepositoryImpl(),
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
    const created = await new CreateEmpaqueUseCase(
      new EmpaqueRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
