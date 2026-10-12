// GET  /api/admin/ordenes/[id]/compartir — enlaces para compartir de la orden, con participantes.
// POST /api/admin/ordenes/[id]/compartir — genera el enlace de una partida { ordenItemId }.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { PastelCompartidoSupabaseDatasource } from "@/modules/admin/store/data/datasources/PastelCompartido.datasource";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  try {
    return NextResponse.json(await new PastelCompartidoSupabaseDatasource().findByOrden(id));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.ordenItemId !== "string")
    return NextResponse.json({ error: "Falta la partida" }, { status: 400 });
  try {
    const compartido = await new PastelCompartidoSupabaseDatasource().crearParaItem(id, body.ordenItemId);
    return NextResponse.json(compartido, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
