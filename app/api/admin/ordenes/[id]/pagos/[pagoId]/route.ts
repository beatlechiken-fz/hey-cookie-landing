import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

interface Params { params: Promise<{ id: string; pagoId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, pagoId } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("orden_pagos")
    .delete()
    .eq("id", pagoId)
    .eq("orden_id", id); // verifica que el pago pertenece a esta orden
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
