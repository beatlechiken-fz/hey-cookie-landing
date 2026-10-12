// POST /api/admin/ordenes/[id]/compartir/participantes
// { compartidoId, nombre } agrega un participante; { compartidoId, solicitante: true } vuelve a agregar al solicitante.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { PastelCompartidoSupabaseDatasource } from "@/modules/admin/store/data/datasources/PastelCompartido.datasource";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.compartidoId !== "string")
    return NextResponse.json({ error: "Falta el enlace" }, { status: 400 });
  try {
    await new PastelCompartidoSupabaseDatasource().agregarParticipante(
      id,
      body.compartidoId,
      body.nombre,
      body.solicitante === true ? "solicitante" : "admin",
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
