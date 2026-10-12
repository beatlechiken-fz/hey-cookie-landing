// POST /api/public/compartir/[token] — respuesta del invitado { participa: boolean, nombre? }.
// Pública (sin sesión): el token aleatorio del enlace es la única llave.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PastelCompartidoSupabaseDatasource } from "@/modules/admin/store/data/datasources/PastelCompartido.datasource";

interface Params { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.participa !== "boolean")
    return NextResponse.json({ error: "Respuesta inválida" }, { status: 400 });
  try {
    await new PastelCompartidoSupabaseDatasource().responder(token, body.participa, body.nombre);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
