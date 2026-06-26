// src/app/api/admin/cupones/validar/route.ts
// POST { codigo, subtotal, clienteId? } — valida un cupón y devuelve el cupón + descuento calculado

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { CuponRepositoryImpl } from "@/modules/admin/store/data/repositories/Cupon.repository.impl";
import { ValidarCuponUseCase } from "@/modules/admin/store/domain/usecases/Cupon.usecase";
import { calcularDescuentoCupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { codigo, subtotal, clienteId } = await req.json();
    if (!codigo || typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "codigo y subtotal son requeridos" },
        { status: 400 },
      );
    }

    const cupon = await new ValidarCuponUseCase(
      new CuponRepositoryImpl(),
    ).execute(codigo, subtotal, clienteId ?? null);
    const montoDescontado = calcularDescuentoCupon(cupon, subtotal);

    return NextResponse.json({ cupon, montoDescontado });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
