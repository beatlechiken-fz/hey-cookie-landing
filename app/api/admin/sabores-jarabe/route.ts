// src/app/api/admin/sabores-jarabe/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { SaborJarabeRepositoryImpl } from "@/modules/admin/raws/data/repositories/Jarabe.repository.impl";
import {
  GetSaboresJarabeUseCase,
  CreateSaborJarabeUseCase,
} from "@/modules/admin/raws/domain/usecases/Jarabe.usecase";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetSaboresJarabeUseCase(
      new SaborJarabeRepositoryImpl(),
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
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const created = await new CreateSaborJarabeUseCase(
      new SaborJarabeRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
