// src/app/api/admin/cupones/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { CuponRepositoryImpl } from "@/modules/admin/store/data/repositories/Cupon.repository.impl";
import {
  GetCuponesUseCase,
  CreateCuponUseCase,
} from "@/modules/admin/store/domain/usecases/Cupon.usecase";
import type { TipoCupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetCuponesUseCase(
      new CuponRepositoryImpl(),
    ).execute({
      search: searchParams.get("search") ?? undefined,
      activo: searchParams.get("activo") !== "false",
      tipo: (searchParams.get("tipo") as TipoCupon) ?? undefined,
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
    const created = await new CreateCuponUseCase(
      new CuponRepositoryImpl(),
    ).execute(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
