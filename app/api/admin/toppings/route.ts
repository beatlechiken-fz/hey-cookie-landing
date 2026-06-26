// src/app/api/admin/toppings/route.ts
// GET — lista todos los ingredientes marcados como topping con sus cantidades

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import {
  IngredienteRepositoryImpl,
  ToppingRepositoryImpl,
} from "@/modules/admin/raws/data/repositories/Ingrediente.repository.impl";
import {
  GetIngredientesUseCase,
  GetToppingsUseCase,
} from "@/modules/admin/raws/domain/usecases/Ingrediente.usecase";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    // Todos los ingredientes con topping=true (sin paginación para el listado de toppings)
    const ingredientes = await new GetIngredientesUseCase(
      new IngredienteRepositoryImpl(),
    ).execute({
      activo: true,
      pageSize: 200,
    });
    const toppingIngredientes = ingredientes.data.filter((i) => i.topping);

    // Sus cantidades definidas
    const cantidades = await new GetToppingsUseCase(
      new ToppingRepositoryImpl(),
    ).execute();
    const cantidadMap = Object.fromEntries(
      cantidades.map((c) => [c.ingredienteId, c]),
    );

    // Merge: ingrediente + su cantidad (si existe)
    const result = toppingIngredientes.map((ing) => ({
      ingrediente: ing,
      cantidad: cantidadMap[ing.id] ?? null,
    }));

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
