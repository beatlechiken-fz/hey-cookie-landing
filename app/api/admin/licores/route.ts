// src/app/api/admin/licores/route.ts
// GET — lista todos los ingredientes de categoría licores_bebidas con sus cantidades

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { LicorRepositoryImpl } from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import { GetLicoresUseCase } from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const result = await new GetLicoresUseCase(
      new LicorRepositoryImpl(),
    ).execute();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
