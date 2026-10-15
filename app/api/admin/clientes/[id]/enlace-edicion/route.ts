// /api/admin/clientes/[id]/enlace-edicion — enlace público para que el cliente actualice sus datos.
// GET: enlace vigente (o null) · POST { regenerar? }: obtiene/crea · DELETE: revoca.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { ClienteRepositoryImpl } from "@/modules/admin/store/data/repositories/Cliente.repository.impl";
import { ClienteEnlaceEdicionRepositoryImpl } from "@/modules/admin/store/data/repositories/ClienteEnlaceEdicion.repository.impl";
import {
  ConsultarEnlaceEdicionUseCase,
  ObtenerEnlaceEdicionUseCase,
  RevocarEnlaceEdicionUseCase,
} from "@/modules/admin/store/domain/usecases/ClienteEnlaceEdicion.usecase";
import { EnlaceEdicionError } from "@/modules/admin/store/domain/entities/ClienteEnlaceEdicion.entity";

type Ctx = { params: Promise<{ id: string }> };

function errorRes(e: unknown) {
  const status = e instanceof EnlaceEdicionError ? e.status : 500;
  return NextResponse.json({ error: (e as Error).message }, { status });
}

export async function GET(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const enlace = await new ConsultarEnlaceEdicionUseCase(
      new ClienteEnlaceEdicionRepositoryImpl(),
      new ClienteRepositoryImpl(),
    ).execute(id, req.nextUrl.origin);
    return NextResponse.json(enlace);
  } catch (e) {
    return errorRes(e);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const enlace = await new ObtenerEnlaceEdicionUseCase(
      new ClienteEnlaceEdicionRepositoryImpl(),
      new ClienteRepositoryImpl(),
    ).execute(id, req.nextUrl.origin, body?.regenerar === true);
    return NextResponse.json(enlace);
  } catch (e) {
    return errorRes(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    await new RevocarEnlaceEdicionUseCase(new ClienteEnlaceEdicionRepositoryImpl()).execute(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return errorRes(e);
  }
}
