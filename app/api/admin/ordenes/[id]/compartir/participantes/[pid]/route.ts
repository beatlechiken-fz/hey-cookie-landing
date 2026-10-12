// DELETE /api/admin/ordenes/[id]/compartir/participantes/[pid] — quita a un participante de la lista.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { PastelCompartidoSupabaseDatasource } from "@/modules/admin/store/data/datasources/PastelCompartido.datasource";

interface Params { params: Promise<{ id: string; pid: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, pid } = await params;
  try {
    await new PastelCompartidoSupabaseDatasource().eliminarParticipante(id, pid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
